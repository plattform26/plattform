import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, orderIndex, contentType } = await req.json();
    const moduleId = params.id;

    const mod = await prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });
    if (!mod || mod.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const lesson = await prisma.courseLesson.create({
      data: {
        courseId: mod.courseId,
        moduleId,
        title,
        orderIndex: orderIndex ?? 0,
        contentType: contentType ?? 'TEXT',
        contentText: ''
      }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
