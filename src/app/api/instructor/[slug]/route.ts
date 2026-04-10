import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { slug: params.slug },
      include: {
        user: {
          select: { name: true, lastName: true },
        },
      },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    const { user, ...profile } = instructorProfile;

    // Obtener cursos PUBLISHED
    const coursesRaw = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id, c.title, c.slug, c.description, c.category, c.level, c.price, c.currency, c.thumbnail_url as "thumbnailUrl",
        COALESCE((SELECT AVG(rating) FROM course_ratings WHERE course_id = c.id), 0) as "averageRating",
        COALESCE((SELECT COUNT(*) FROM enrollments WHERE course_id = c.id), 0) as "studentCount"
      FROM courses c
      WHERE c.instructor_id = ${instructorProfile.userId}
        AND c.status = 'PUBLISHED' 
        AND c.visibility = 'PUBLIC' 
        AND c.deleted_at IS NULL
    `;

    const courses = coursesRaw.map((c) => ({
      ...c,
      price: Number(c.price),
      averageRating: Number(c.averageRating),
      studentCount: Number(c.studentCount),
    }));

    return NextResponse.json({
      name: user.name + ' ' + user.lastName,
      ...profile,
      courses,
    });
  } catch (error: any) {
    console.error('API /instructor/[slug] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
