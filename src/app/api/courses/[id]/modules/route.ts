import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, orderIndex } = await req.json();
    const courseId = params.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    if (session.role !== 'ADMIN' && course.instructorId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const mod = await prisma.courseModule.create({
      data: {
        courseId,
        title,
        orderIndex: orderIndex ?? 0
      }
    });

    return NextResponse.json(mod);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
