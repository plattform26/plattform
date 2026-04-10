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
    if (role) where.role = role;
    if (status) where.status = status;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
         instructorProfile: {
           include: {
             subscriptions: {
               where: { status: 'ACTIVE' },
               include: { plan: true },
               take: 1
             }
           }
         },
         _count: {
           select: {
             enrollments: true,
             courses: true
           }
         }
      }
    });

    // Mapear para facilitar consumo en el cliente
    const formattedUsers = users.map(u => ({
      ...u,
      plan: u.instructorProfile?.subscriptions[0]?.plan?.displayName || 'N/A',
      courseCount: u._count.courses,
      enrollmentCount: u._count.enrollments
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
