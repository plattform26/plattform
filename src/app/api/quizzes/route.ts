import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isCourseLocked } from '@/lib/course-protection';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, lessonId, title, passingScore = 70, totalScore, scoreDistribution = 'AUTOMATIC' } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 });
    }

    // Validate totalScore: must be 10 or 100
    const ts = Number(totalScore);
    if (ts !== 10 && ts !== 100) {
      return NextResponse.json({ error: 'totalScore must be 10 or 100' }, { status: 400 });
    }

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
