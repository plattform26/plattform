import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { slug: params.slug },
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            email: true,
            status: true
          }
        }
      }
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Obtener cursos PUBLISHED de forma segura
    const coursesData = await prisma.course.findMany({
      where: {
        instructorId: instructorProfile.userId,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        deletedAt: null
      },
      include: {
        _count: {
          select: { enrollments: true }
        },
        ratings: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapeo de cursos con métricas
    const courses = coursesData.map(c => {
      const avgRating = c.ratings.length > 0 
        ? c.ratings.reduce((acc, r) => acc + r.rating, 0) / c.ratings.length 
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
        averageRating: Number(avgRating.toFixed(1)),
        studentCount: c._count.enrollments
      };
    });

    // Reputación Global y Métricas
    const totalStudents = courses.reduce((acc, c) => acc + c.studentCount, 0);
    const publishedCoursesCount = courses.length;
    
    const coursesWithRatings = courses.filter(c => c.averageRating > 0);
    const globalRating = coursesWithRatings.length > 0
      ? coursesWithRatings.reduce((acc, c) => acc + c.averageRating, 0) / coursesWithRatings.length
      : 5.0; // Valor por defecto para academias nuevas sin ratings

    return NextResponse.json({
      id: instructorProfile.id,
      userId: instructorProfile.userId,
      academyName: instructorProfile.academyName,
      slug: instructorProfile.slug,
      logoUrl: instructorProfile.logoUrl,
      bannerUrl: instructorProfile.bannerUrl,
      description: instructorProfile.description,
      institution: instructorProfile.institution,
      linkedinUrl: instructorProfile.linkedinUrl,
      specialty: instructorProfile.specialty || "Instructor Certificado",
      name: `${instructorProfile.user.name} ${instructorProfile.user.lastName}`,
      status: instructorProfile.user.status,
      courses,
      metrics: {
        globalRating: Number(globalRating.toFixed(1)),
        totalStudents,
        publishedCoursesCount
      }
    });

  } catch (error: any) {
    console.error('❌ API /instructor/[slug] CRITICAL ERROR:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
