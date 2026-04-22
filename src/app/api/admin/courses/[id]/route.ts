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

/**
 * DELETE /api/admin/courses/[id]
 * Misión: Control Maestro v8.0 - Hard Delete con Auditoría
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acceso denegado: Se requieren permisos de administrador.' }, { status: 403 });
  }

  const { id } = params;
  try {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });

    // Transacción para asegurar el borrado y el log simultáneamente
    await prisma.$transaction([
      prisma.course.delete({ where: { id } }),
      prisma.courseDeletionLog.create({
        data: {
          courseId: id,
          courseTitle: course.title,
          adminEmail: session.email || 'unknown@plattform.mx'
        }
      })
    ]);

    console.log(`[ADMIN_AUDIT] Curso "${course.title}" eliminado por ${session.email}`);

    return NextResponse.json({ message: 'Curso eliminado definitivamente y registrado en Bitácora.' });
  } catch (error: any) {
    console.error('❌ ERROR EN HARD DELETE:', error.message);
    return NextResponse.json({ error: 'Error al eliminar el curso de forma física' }, { status: 500 });
  }
}
