import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
    const course = await prisma.course.findFirst({
      where: {
        OR: isUuid ? [
          { id: params.id },
          { slug: params.id }
        ] : [
          { slug: params.id }
        ],
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        deletedAt: null,
      },
      include: {
        instructor: {
          include: {
            instructorProfile: true,
          },
        },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Calcular promedios, counts, etc. usando Prisma Aggregate para evitar problemas de cast UUID
    const ratingStats = await prisma.courseRating.aggregate({
      where: { courseId: course.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    const studentCount = await prisma.enrollment.count({
      where: { courseId: course.id },
    });

    const stats = {
      averageRating: ratingStats._avg.rating || 0,
      reviewCount: ratingStats._count.id,
      studentCount,
    };

    // Regla de Negocio: Ocultar content si no es isPreview
    const sanitizedModules = course.modules.map((mod) => {
      return {
        ...mod,
        lessons: mod.lessons.map((lesson) => {
          if (lesson.isPreview) {
            return lesson;
          }
          // Hide sensitive content
          return {
            id: lesson.id,
            moduleId: lesson.moduleId,
            title: lesson.title,
            subtitle: lesson.subtitle,
            contentType: lesson.contentType,
            orderIndex: lesson.orderIndex,
            durationMinutes: lesson.durationMinutes,
            isPreview: lesson.isPreview,
            // Hidden fields
            contentText: null,
            videoUrl: null,
          };
        }),
      };
    });

    return NextResponse.json({
      ...course,
      instructor: {
        name: course.instructor.name + ' ' + course.instructor.lastName,
        academyName: course.instructor.instructorProfile?.academyName,
        institution: course.instructor.instructorProfile?.institution,
        description: course.instructor.instructorProfile?.description,
      },
      modules: sanitizedModules,
      stats: {
        averageRating: Number(stats.averageRating),
        reviewCount: Number(stats.reviewCount),
        studentCount: Number(stats.studentCount),
      },
    });

  } catch (error: any) {
    console.error('API /courses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
