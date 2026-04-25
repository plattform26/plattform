import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isCourseLocked } from '@/lib/course-protection';
import { createLessonSchema } from '@/lib/validations/courses';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createLessonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { courseId, moduleId, title, subtitle, contentText, videoUrl, contentType, orderIndex, durationMinutes, isPreview } = validation.data;

    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
      include: { _count: { select: { enrollments: true } } }
    });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    if (session.role !== 'ADMIN' && course.instructorId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
      const last = await prisma.courseLesson.findFirst({
        where: { courseId, moduleId: moduleId ?? null },
        orderBy: { orderIndex: 'desc' }
      });
      nextIndex = (last?.orderIndex ?? 0) + 1;
    }

    const lesson = await prisma.courseLesson.create({
      data: {
        courseId,
        moduleId: moduleId ?? null,
        title,
        subtitle: subtitle ?? null,
        contentText: contentText ?? '',
        videoUrl: videoUrl ?? null,
        contentType: contentType ?? 'TEXT',
        orderIndex: nextIndex,
        durationMinutes: durationMinutes ?? null,
        isPreview: isPreview ?? false,
      }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
