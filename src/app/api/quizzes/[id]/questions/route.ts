import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { questionText, questionType, optionsJson, correctAnswer, points } = body;

    // Get quiz and verify ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { course: true, questions: { orderBy: { orderIndex: 'asc' } } }
    });
    if (!quiz || quiz.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!questionText || !questionType || !optionsJson || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate options count: min 2, max 15
    const options = Array.isArray(optionsJson) ? optionsJson : JSON.parse(optionsJson);
    if (options.length < 2 || options.length > 15) {
      return NextResponse.json({ error: 'Questions must have between 2 and 15 options' }, { status: 400 });
    }

    // Validate correctAnswer
    const answers = Array.isArray(correctAnswer) ? correctAnswer : JSON.parse(correctAnswer);
    if (questionType === 'SINGLE' && answers.length !== 1) {
      return NextResponse.json({ error: 'SINGLE questions must have exactly 1 correct answer' }, { status: 400 });
    }
    if (questionType === 'MULTIPLE' && answers.length < 1) {
      return NextResponse.json({ error: 'MULTIPLE questions must have at least 1 correct answer' }, { status: 400 });
    }

    const nextIndex = (quiz.questions[quiz.questions.length - 1]?.orderIndex ?? 0) + 1;

    // Calculate points based on score distribution
    let questionPoints = Number(points ?? 1);
    if (quiz.scoreDistribution === 'AUTOMATIC') {
      // Auto-distribute: will be recalculated after adding
      const totalQuestions = quiz.questions.length + 1; // including this new one
      const basePoints = Math.floor(quiz.totalScore / totalQuestions);
      const remainder = quiz.totalScore % totalQuestions;

      // Update all existing questions with equal distribution
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        await prisma.quizQuestion.update({
          where: { id: q.id },
          data: { points: basePoints }
        });
      }
      // Last question (new one) absorbs remainder
      questionPoints = basePoints + remainder;
    }

    const question = await prisma.quizQuestion.create({
      data: {
        quizId: params.id,
        questionText,
        questionType,
        optionsJson: options,
        correctAnswer: answers,
        points: questionPoints,
        orderIndex: nextIndex,
        options: {
          create: options.map((opt: any, index: number) => ({
            optionText: typeof opt === 'string' ? opt : opt.text,
            isCorrect: Array.isArray(answers) ? answers.includes(typeof opt === 'string' ? opt : opt.id) : answers === (typeof opt === 'string' ? opt : opt.id),
            orderIndex: index + 1
          }))
        }
      }
    });

    // Update correctAnswer to use the new IDs if needed, but for now we keep the string/json for compatibility


    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
