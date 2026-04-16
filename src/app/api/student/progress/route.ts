import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!session || !courseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await prisma.progress.findMany({
      where: {
        userId: session.userId,
        courseId,
        completed: true,
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'STUDENT' && session.role !== 'ADMIN' && session.role !== 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, lessonId, completed } = body;

    if (!courseId || !lessonId) {
      return NextResponse.json({ error: 'Body mismatch' }, { status: 400 });
    }

    // --- Misión: Validación de Permisos de Vista Previa ---
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { lessons: true } } }
    });

    if (!course) throw new Error('Course not found');

    // Si es Instructor, solo puede marcar progreso si es el dueño del curso o si está inscrito (Admin ignora esto)
    if (session.role === 'INSTRUCTOR') {
       const isOwner = course.instructorId === session.userId;
       const enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.userId, courseId } }
       });

       if (!isOwner && !enrollment) {
          return NextResponse.json({ error: 'No tienes permiso para registrar progreso en este curso' }, { status: 403 });
       }
    }

    // Check if progress already exists and is already completed
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId,
        }
      }
    });

    if (existingProgress?.completed && !!completed) {
       // Si ya está completada e intentamos marcarla como tal, no hacer nada
       return NextResponse.json(existingProgress);
    }
    
    // Count ONLY other lessons (excluding current if it's new)
    const completedCount = await prisma.progress.count({
      where: { 
        userId: session.userId, 
        courseId, 
        completed: true,
        NOT: { lessonId } 
      }
    });

    const totalLessons = course?._count.lessons || 0;

    if (completed && completedCount >= totalLessons) {
        // Bloquear incremento si el total de OTRAS lecciones ya es igual al total (teóricamente imposible pero seguro)
        return NextResponse.json({ error: 'Progress capped at 100%' }, { status: 400 });
    }

    // Upsert progress
    const record = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId,
        }
      },
      update: {
        completed: !!completed,
        completedAt: completed ? (existingProgress?.completedAt || new Date()) : null,
      },
      create: {
        userId: session.userId,
        courseId,
        lessonId,
        completed: !!completed,
        completedAt: completed ? new Date() : null,
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('API /student/progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
