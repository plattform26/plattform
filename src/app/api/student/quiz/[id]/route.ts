import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            options: true
          }
        },
        course: {
          select: { title: true }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // BINDING_FIX: Asegurar que el array 'options' se entregue correctamente desde la tabla QuizOption
    const sanitizedQuestions = quiz.questions.map(q => {
      // Debug log para el servidor
      console.log(`[API DEBUG] Question ID: ${q.id}, Options Found in Relation: ${q.options?.length || 0}`);
      
      return {
        id: q.id,
        quizId: q.quizId,
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points,
        orderIndex: q.orderIndex,
        options: (q.options || []).map(opt => ({
          id: opt.id,
          optionText: opt.optionText,
          orderIndex: opt.orderIndex
        }))
      };
    });

    const responsePayload = {
      id: quiz.id,
      courseId: quiz.courseId,
      lessonId: quiz.lessonId,
      title: quiz.title,
      passingScore: quiz.passingScore,
      totalScore: quiz.totalScore,
      scoreDistribution: quiz.scoreDistribution,
      questions: sanitizedQuestions
    };

    console.log(`DEBUG API [GET]: Examen "${quiz.title}" enviado con ${sanitizedQuestions.length} preguntas.`);
    
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('API /student/quiz/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
