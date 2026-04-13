import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isCourseLocked } from '@/lib/course-protection';

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

    // Lógica de Bloqueo de Edición (Seguridad en Producción)
    const lock = await isCourseLocked(lesson.courseId, session.role);
    if (lock.locked) {
        return NextResponse.json({ 
          error: 'CURSO_BLOQUEADO',
          message: lock.reason 
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

      // Lógica de Bloqueo de Eliminación (Seguridad en Producción)
      const lock = await isCourseLocked(lesson.courseId, session.role);
      if (lock.locked) {
          return NextResponse.json({ 
            error: 'CURSO_BLOQUEADO',
            message: lock.reason
          }, { status: 403 });
      }
  
      await prisma.courseLesson.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Error al eliminar lección' }, { status: 500 });
    }
}
