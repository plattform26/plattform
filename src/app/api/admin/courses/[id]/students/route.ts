import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET /api/admin/courses/[id]/students
 * Misión: Detalle de Alumnos por Curso v7.0
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            lastLoginAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const studentList = enrollments.map(e => ({
      id: e.user.id,
      name: e.user.name,
      lastName: e.user.lastName,
      email: e.user.email,
      lastLoginAt: e.user.lastLoginAt ? e.user.lastLoginAt.toISOString() : null,
      enrolledAt: e.createdAt.toISOString(),
    }));


    return NextResponse.json(studentList);
  } catch (error: any) {
    console.error('❌ ERROR AL OBTENER ALUMNOS DEL CURSO:', error.message);
    return NextResponse.json({ error: 'Error al obtener alumnos' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/courses/[id]/students?userId=...
 * Misión: Control Maestro v8.0 - Eliminar Inscripción Individual
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acceso denegado: Se requieren permisos de administrador.' }, { status: 403 });
  }

  const { id: courseId } = params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
  }

  try {
    // Borrado definitivo del enrollment
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        }
      }
    });

    return NextResponse.json({ message: 'Alumno eliminado del curso exitosamente.' });
  } catch (error: any) {
    console.error('❌ ERROR AL ELIMINAR ALUMNO DEL CURSO:', error.message);
    return NextResponse.json({ error: 'Error al intentar eliminar la inscripción.' }, { status: 500 });
  }
}
