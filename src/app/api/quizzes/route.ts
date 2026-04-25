import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isCourseLocked } from '@/lib/course-protection';
import { createQuizSchema } from '@/lib/validations/courses';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createQuizSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { courseId, lessonId, title, passingScore, totalScore, scoreDistribution } = validation.data;

    // Verify course belongs to instructor
    const where: any = { id: courseId, deletedAt: null };
    if (session.role !== 'ADMIN') {
        where.instructorId = session.userId;
    }
    const course = await prisma.course.findUnique({ where });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    // Lógica de Bloqueo (Seguridad en Producción)
    const lock = await isCourseLocked(courseId, session.role);
    if (lock.locked) {
        return NextResponse.json({ 
          error: 'CURSO_BLOQUEADO',
          message: lock.reason
        }, { status: 403 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        lessonId: lessonId ?? null,
        title,
        passingScore: Number(passingScore),
        totalScore: ts,
        scoreDistribution,
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
