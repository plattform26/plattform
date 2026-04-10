import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, subtitle, contentText, videoUrl, isPreview, contentType, durationMinutes, moduleId, orderIndex, summary, funFact } = body;

    // Verify ownership/permission
    const lesson = await prisma.courseLesson.findUnique({
      where: { id },
      include: { 
        course: { include: { _count: { select: { enrollments: true } } } } 
      }
    });

    if (!lesson) return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
    
    if (session.role !== 'ADMIN' && lesson.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lógica de Bloqueo de Edición - Solo para Instructores
    const hasEnrollments = lesson.course._count.enrollments > 0;
    const isActive = lesson.course.status === 'PUBLISHED' || lesson.course.status === 'HIBERNATED';
    
    if (session.role === 'INSTRUCTOR' && hasEnrollments && isActive) {
        return NextResponse.json({ 
          error: 'CURSO_BLOQUEADO',
          message: 'Este curso tiene alumnos activos y sus lecciones no pueden ser editadas.' 
        }, { status: 403 });
    }

    const updated = await prisma.courseLesson.update({
      where: { id },
      data: {
        title: title ?? undefined,
        subtitle: subtitle ?? undefined,
        contentText: contentText ?? undefined,
        videoUrl: videoUrl ?? undefined,
        isPreview: isPreview ?? undefined,
        contentType: contentType ?? undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        moduleId: moduleId ?? undefined,
        orderIndex: orderIndex ?? undefined,
        summary: summary ?? undefined,
        funFact: funFact ?? undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getSession();
      if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { id } = params;
      const lesson = await prisma.courseLesson.findUnique({
        where: { id },
        include: { course: true }
      });
  
      if (!lesson) {
        return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
      }
  
      if (session.role !== 'ADMIN' && lesson.course.instructorId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
  
      return NextResponse.json(lesson);
    } catch (error) {
      console.error('Get lesson error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getSession();
      if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { id } = params;
      const lesson = await prisma.courseLesson.findUnique({
        where: { id },
        include: { 
          course: { include: { _count: { select: { enrollments: true } } } } 
        }
      });
  
      if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (session.role !== 'ADMIN' && lesson.course.instructorId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Lógica de Bloqueo de Eliminación - Solo para Instructores
      const hasEnrollments = lesson.course._count.enrollments > 0;
      const isActive = lesson.course.status === 'PUBLISHED' || lesson.course.status === 'HIBERNATED';

      if (session.role === 'INSTRUCTOR' && hasEnrollments && isActive) {
          return NextResponse.json({ 
            error: 'CURSO_BLOQUEADO',
            message: 'No puedes eliminar lecciones de un curso con alumnos activos.' 
          }, { status: 403 });
      }
  
      await prisma.courseLesson.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Error al eliminar lección' }, { status: 500 });
    }
}
