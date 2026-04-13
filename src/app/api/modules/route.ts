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
    const { courseId, title, orderIndex } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 });
    }

    // Verify course access
    const where: any = { id: courseId, deletedAt: null };
    if (session.role !== 'ADMIN') {
      where.instructorId = session.userId;
    }

    const course = await prisma.course.findFirst({ 
      where,
      include: { _count: { select: { enrollments: true } } }
    });
    if (!course) return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });

    // Lógica de Bloqueo (Seguridad en Producción)
    const lock = await isCourseLocked(courseId, session.role);
    if (lock.locked) {
        return NextResponse.json({ 
          error: 'CURSO_BLOQUEADO',
          message: lock.reason
        }, { status: 403 });
    }

    // Get next orderIndex if not provided
    let nextIndex = orderIndex;
    if (nextIndex === undefined) {
      const last = await prisma.courseModule.findFirst({
        where: { courseId },
        orderBy: { orderIndex: 'desc' }
      });
      nextIndex = (last?.orderIndex ?? 0) + 1;
    }

    const mod = await prisma.courseModule.create({
      data: { courseId, title, orderIndex: nextIndex }
    });

    return NextResponse.json(mod);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
