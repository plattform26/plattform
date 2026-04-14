import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    let baseSql = `
      SELECT 
        c.id, c.title, c.slug, c.description, c.category, c.level, c.price, c.currency, c.thumbnail_url as "thumbnailUrl",
        i.academy_name as "instructorName",
        COALESCE((SELECT AVG(rating) FROM course_ratings WHERE course_id = c.id), 0) as "averageRating",
        COALESCE((SELECT COUNT(*) FROM enrollments WHERE course_id = c.id), 0) as "studentCount"
      FROM courses c
      JOIN instructor_profiles i ON c.instructor_id = i.user_id
      WHERE c.status = 'PUBLISHED' 
        AND c.visibility = 'PUBLIC' 
        AND c.deleted_at IS NULL
    `;

    const args: any[] = [];
    let argIndex = 1;

    if (query) {
      baseSql += ` AND to_tsvector('spanish', c.title || ' ' || c.description) @@ plainto_tsquery('spanish', $${argIndex++})`;
      args.push(query);
    }
    if (category) {
      baseSql += ` AND c.category = CAST($${argIndex++} AS "CourseCategory")`;
      args.push(category);
    }
    if (level) {
      baseSql += ` AND c.level = CAST($${argIndex++} AS "CourseLevel")`;
      args.push(level);
    }

    baseSql += ` ORDER BY "studentCount" DESC`;

    const coursesRaw = await prisma.$queryRawUnsafe<any[]>(baseSql, ...args);

    // Convert decimal/bigint from Postgres back to plain numbers or strings
    const courses = coursesRaw.map((c: any) => ({
      ...c,
      price: Number(c.price),
      averageRating: Number(c.averageRating),
      studentCount: Number(c.studentCount),
    }));

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('API /courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { getSession } from '@/lib/auth';
import slugify from 'slugify';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, price, category, level, description, durationHours = 0, instructorId } = body;

    // Solo admin puede elegir instructor. Instructores normales usan su propio ID.
    const targetInstructorId = (session.role === 'ADMIN' && instructorId) ? instructorId : session.userId;

    if (!title || price === undefined) {
      return NextResponse.json({ error: 'Title and price are required' }, { status: 400 });
    }

    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    // unique constraint is instructorId + slug
    while (await prisma.course.findUnique({ where: { instructorId_slug: { instructorId: targetInstructorId, slug } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newCourse = await prisma.course.create({
      data: {
        instructorId: targetInstructorId,
        title,
        slug,
        description: description || '',
        category: category || 'OTHER',
        level: level || 'BEGINNER',
        price: Number(price),
        status: 'DRAFT',
        visibility: 'PRIVATE',
        durationHours: Number(durationHours)
      }
    });

    return NextResponse.json(newCourse);
  } catch (error: any) {
    console.error('API POST /courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
