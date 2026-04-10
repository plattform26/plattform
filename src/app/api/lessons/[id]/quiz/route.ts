import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch quiz and questions for a specific lesson
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!quiz) return NextResponse.json(null);

    // BINDING_FIX: Saneamiento radical de datos legacy
    const sanitizedQuestions = quiz.questions.map(q => ({
      id: q.id,
      quizId: q.quizId,
      questionText: q.questionText,
      questionType: q.questionType,
      points: q.points,
      orderIndex: q.orderIndex,
      options: q.options // Única fuente autorizada
    }));

    return NextResponse.json({
      ...quiz,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Error fetching quiz' }, { status: 500 });
  }
}

// POST: Create or Update Quiz metadata for a lesson
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;
    const { title, passingScore = 70, totalScore = 100 } = await req.json();

    // Find courseId from lesson
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true }
    });

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    const quiz = await prisma.quiz.upsert({
      where: { lessonId },
      update: { 
        title, 
        passingScore: parseInt(String(passingScore)), 
        totalScore: parseInt(String(totalScore)) 
      },
      create: {
        lessonId,
        courseId: lesson.courseId,
        title,
        passingScore: parseInt(String(passingScore)),
        totalScore: parseInt(String(totalScore))
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error saving quiz:', error);
    return NextResponse.json({ error: 'Error saving quiz' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;
    const { title, passingScore, totalScore } = await req.json();

    const quiz = await prisma.quiz.update({
      where: { lessonId },
      data: {
        title: title || undefined,
        passingScore: passingScore ? parseInt(String(passingScore)) : undefined,
        totalScore: totalScore ? parseInt(String(totalScore)) : undefined,
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating quiz metadata' }, { status: 500 });
  }
}
