export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.userId,
        status: 'ACTIVE',
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                lastName: true,
              }
            },
            _count: {
              select: {
                lessons: true,
              }
            }
          }
        }
      }
    });

    const coursesWithProgress = await Promise.all(enrollments.map(async (en: any) => {
      const completedLessons = await prisma.progress.count({
        where: {
          userId: session.userId,
          courseId: en.courseId,
          completed: true,
        }
      });

      const allLessonIds: string[] = (await prisma.courseLesson.findMany({
        where: { courseId: en.courseId },
        orderBy: { orderIndex: 'asc' },
        select: { id: true }
      })).map((l: { id: string }) => l.id);

      const completedLessonIds: string[] = (await prisma.progress.findMany({
        where: { userId: session.userId, courseId: en.courseId, completed: true },
        select: { lessonId: true }
      })).map((l: { lessonId: string }) => l.lessonId);

      const nextLessonId = allLessonIds.find((id: string) => !completedLessonIds.includes(id)) || allLessonIds[0];
      const totalLessons = en.course._count.lessons;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: en.course.id,
        title: en.course.title,
        slug: en.course.slug,
        thumbnailUrl: en.course.thumbnailUrl,
        category: en.course.category,
        instructorName: `${en.course.instructor.name} ${en.course.instructor.lastName}`,
        progressPercent,
        completedLessons,
        totalLessons,
      };
    }));

    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.error('API /student/courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

