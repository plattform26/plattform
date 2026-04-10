import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string, questionId: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionText, questionType, optionsJson, correctAnswer, points, orderIndex } = await req.json();

    const question = await prisma.quizQuestion.findUnique({
      where: { id: params.questionId },
      include: { quiz: { include: { course: true } } }
    });

    if (!question || question.quiz.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // If options are provided, update the QuizOption table as well
    if (optionsJson) {
      const options = Array.isArray(optionsJson) ? optionsJson : JSON.parse(optionsJson);
      const answers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer].filter(Boolean);

      await prisma.quizOption.deleteMany({
        where: { questionId: params.questionId }
      });

      await prisma.quizOption.createMany({
        data: options.map((opt: any, index: number) => ({
          questionId: params.questionId,
          optionText: typeof opt === 'string' ? opt : (opt.text || opt.optionText),
          isCorrect: Array.isArray(answers) ? answers.includes(typeof opt === 'string' ? opt : (opt.id || opt.optionText)) : (answers === (typeof opt === 'string' ? opt : (opt.id || opt.optionText))),
          orderIndex: index + 1
        }))
      });
    }

    const updated = await prisma.quizQuestion.update({
      where: { id: params.questionId },
      data: {
        questionText: questionText ?? undefined,
        questionType: questionType ?? undefined,
        optionsJson: optionsJson ?? undefined,
        correctAnswer: correctAnswer ?? undefined,
        points: points !== undefined ? Number(points) : undefined,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined,
      }
    });


    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string, questionId: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const question = await prisma.quizQuestion.findUnique({
      where: { id: params.questionId },
      include: { quiz: { include: { course: true } } }
    });

    if (!question || question.quiz.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.quizQuestion.delete({
      where: { id: params.questionId }
    });

    return NextResponse.json({ message: 'Question deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
