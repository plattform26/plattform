import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any = { id: params.id };
    if (session.role !== 'ADMIN') {
      whereClause.instructorId = session.userId;
    }

    const course = await prisma.course.findFirst({
      where: whereClause,
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              include: { quiz: true }
            }
          }
        },
        quizzes: {
          orderBy: { createdAt: 'desc' },
          include: { questions: { orderBy: { orderIndex: 'asc' } } }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Builder API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
