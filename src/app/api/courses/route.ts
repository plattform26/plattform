import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    // Misión: Motor de Visibilidad v8.2 - Implementación vía Prisma Client
    const coursesRaw = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        // Si hay una query de búsqueda, aplicamos el filtro
        ...(query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ]
        } : {}),
        ...(category ? { category: category as any } : {}),
        ...(level ? { level: level as any } : {}),
      },
      include: {
        instructor: {
           include: {
              instructorProfile: {
                 select: { academyName: true }
              }
           }
        },
        _count: {
          select: { enrollments: true }
        },
        ratings: {
          select: { rating: true }
        }
      },
      // Orden por fecha por defecto (v8.2)
      orderBy: { createdAt: 'desc' }
    });

    // Procesamos para calcular promedios y formatear nombres
    const courses = coursesRaw.map(c => {
      const instructorName = c.instructor?.instructorProfile?.academyName || 'Plattform Expert';
      const avgRating = c.ratings.length > 0 
        ? c.ratings.reduce((acc, curr) => acc + curr.rating, 0) / c.ratings.length 
        : 0;

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        category: c.category,
        level: c.level,
        price: Number(c.price),
        currency: c.currency,
        thumbnailUrl: c.thumbnailUrl,
        instructorName,
        averageRating: avgRating,
        studentCount: c._count.enrollments,
        durationHours: c.durationHours
      };
    });

    // Ordenamiento Final: Calificados primero, luego recientes (v8.2)
    courses.sort((a, b) => {
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return 0; // Ya están ordenados por createdAt en la query de Prisma
    });

    // Límite de 8 para el home/landing
    const result = (!query && !category && !level) ? courses.slice(0, 8) : courses;

    return NextResponse.json(result);
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

    console.log('[API_COURSES] Payload received:', { title, category, price });

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
        category: category || 'STRATEGY_BUSINESS',
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
