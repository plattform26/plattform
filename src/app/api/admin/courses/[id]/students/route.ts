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
