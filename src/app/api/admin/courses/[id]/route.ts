import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * PATCH /api/admin/courses/[id]
 * Actualiza el estado del curso.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  try {
    const { status } = await req.json(); // PUBLISHED, HIBERNATED, ARCHIVED

    const course = await prisma.course.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar curso' }, { status: 500 });
  }
}
