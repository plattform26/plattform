import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    
    if (status) {
        where.status = status;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { instructor: { name: { contains: query, mode: 'insensitive' } } },
        { instructor: { lastName: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
         instructor: { select: { id: true, name: true, lastName: true, email: true } },
         _count: { select: { enrollments: true } }
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching admin courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
