import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Esquema de validación para metadatos del quiz
const quizSchema = z.object({
  title: z.string().min(1).max(200),
  passingScore: z.number().min(0).max(100).optional(),
  totalScore: z.number().min(1).optional(),
}).strict();

/**
 * Helper para validar permisos de gestión de quiz.
 * Solo ADMIN e INSTRUCTOR (dueño del curso) pueden acceder.
 * Los estudiantes tienen prohibido este endpoint (usan /api/student/quiz).
 */
async function checkQuizPermissions(lessonId: string) {
  const session = await getSession();
  
  if (!session || (session.role !== 'ADMIN' && session.role !== 'INSTRUCTOR')) {
    return { error: 'No autorizado', status: 401 };
  }

  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { id: true, instructorId: true } } }
  });

  if (!lesson) {
    return { error: 'Lección no encontrada', status: 404 };
  }

  if (session.role === 'INSTRUCTOR' && lesson.course.instructorId !== session.userId) {
    return { error: 'No tienes permiso para gestionar el examen de este curso', status: 403 };
  }

  return { session, lesson };
}

// GET: Fetch quiz and questions for a specific lesson (Admin/Instructor Only)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkQuizPermissions(params.id);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId: params.id },
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

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Error al obtener el examen' }, { status: 500 });
  }
}

// POST: Create or Update Quiz metadata for a lesson
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkQuizPermissions(params.id);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const validation = quizSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Payload inválido', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { title, passingScore = 70, totalScore = 100 } = validation.data;

    const quiz = await prisma.quiz.upsert({
      where: { lessonId: params.id },
      update: { 
        title, 
        passingScore, 
        totalScore 
      },
      create: {
        lessonId: params.id,
        courseId: auth.lesson.course.id,
        title,
        passingScore,
        totalScore
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error saving quiz:', error);
    return NextResponse.json({ error: 'Error al guardar el examen' }, { status: 500 });
  }
}

// PATCH: Update Quiz metadata partial
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkQuizPermissions(params.id);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const validation = quizSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Payload inválido', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const quiz = await prisma.quiz.update({
      where: { lessonId: params.id },
      data: validation.data
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Error al actualizar el examen' }, { status: 500 });
  }
}
