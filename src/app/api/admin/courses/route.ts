export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    
    if (status) {
        where.status = status;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { instructor: { name: { contains: query, mode: 'insensitive' } } },
        { instructor: { lastName: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
         instructor: { select: { id: true, name: true, lastName: true, email: true } },
         _count: { select: { enrollments: true } }
      }
    });

        // 2. Fetch aggregated ratings
    const aggregatedRatings = await prisma.courseRating.groupBy({
      by: ['courseId'],
      _avg: { rating: true },
      _count: { id: true }
    });

    // 3. Merge data
    const coursesWithRatings = courses.map(course => {
      const ratingData = aggregatedRatings.find(r => r.courseId === course.id);
      return {
        ...course,
        avgRating: ratingData?._avg.rating || 0,
        ratingCount: ratingData?._count.id || 0
      };
    });

    return NextResponse.json(coursesWithRatings);

  } catch (error) {
    console.error('Error fetching admin courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

