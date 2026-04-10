import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: {
        instructorId: session.userId,
        deletedAt: null
      },
      select: {
        id: true,
        title: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
