import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET /api/admin/users
 * Lista usuarios con filto por rol y búsqueda.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role'); // STUDENT, INSTRUCTOR, null (all)
  const query = searchParams.get('q');
  const status = searchParams.get('status');

  try {
    const where: any = {};
    if (role && role !== 'ALL') where.role = role;
    if (status) where.status = status;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Consulta simplificada para evitar errores de relación compleja o tipos no serializables
    const users = await prisma.user.findMany({
      where,
      include: {
        instructorProfile: true, 
        _count: {
          select: { courses: true, enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });


    // Mapear para facilitar consumo en el cliente y asegurar tipos planos (Blindaje de Datos)
    const cleanUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      status: u.status,
      // Misión: Expansión de Gestión - Campos de Cortesía
      isCourtesy: u.isCourtesy,
      courtesyPlanId: u.courtesyPlanId,
      // Aquí está el truco: buscamos la especialidad en el perfil, con un fallback
      specialty: u.instructorProfile?.specialty || 'N/A',
      createdAt: u.createdAt.toISOString(),
      _count: {
        courses: u._count?.courses || 0,
        enrollments: u._count?.enrollments || 0
      }
    }));


    // Serialización profunda para evitar errores de red (Next.js 500) en listas largas con tipos complejos
    const finalResponse = JSON.parse(JSON.stringify(cleanUsers));

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    // Diagnóstico de Terminal (Indispensable)
    console.error('❌ ERROR CRÍTICO EN LISTA ADMIN:', error.message);
    
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}

