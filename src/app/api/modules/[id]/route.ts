import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, orderIndex } = body;

    // Verify ownership via course
    const mod = await prisma.courseModule.findUnique({
      where: { id: params.id },
      include: { 
        course: { include: { _count: { select: { enrollments: true } } } } 
      }
    });
    
    if (!mod) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (session.role !== 'ADMIN' && mod.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lógica de Bloqueo de Edición - Solo para Instructores
    const hasEnrollments = mod.course._count.enrollments > 0;
    const isActive = mod.course.status === 'PUBLISHED' || mod.course.status === 'HIBERNATED';

    if (session.role === 'INSTRUCTOR' && hasEnrollments && isActive) {
        return NextResponse.json({ 
          error: 'CURSO_BLOQUEADO',
          message: 'Este curso tiene alumnos activos y sus módulos no pueden ser editados.' 
        }, { status: 403 });
    }

    const updated = await prisma.courseModule.update({
      where: { id: params.id },
      data: {
        title: title ?? mod.title,
        orderIndex: orderIndex ?? mod.orderIndex,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mod = await prisma.courseModule.findUnique({
      where: { id: params.id },
      include: { 
        course: { include: { _count: { select: { enrollments: true } } } } 
      }
    });
    
    if (!mod) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (session.role !== 'ADMIN' && mod.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lógica de Bloqueo de Eliminación - Solo para Instructores
    const hasEnrollments = mod.course._count.enrollments > 0;
    const isActive = mod.course.status === 'PUBLISHED' || mod.course.status === 'HIBERNATED';

    if (session.role === 'INSTRUCTOR' && hasEnrollments && isActive) {
        return NextResponse.json({ 
          error: 'CURSO_BLOQUEADO',
          message: 'No puedes eliminar módulos de un curso con alumnos activos.' 
        }, { status: 403 });
    }

    await prisma.courseModule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
