import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const selectedCourseId = searchParams.get('courseId');

    const where: any = {
      courseId: selectedCourseId || undefined
    };

    if (session.role !== 'ADMIN') {
      where.course = { instructorId: session.userId, deletedAt: null };
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: { 
          include: {
            progressRecords: true,
            quizAttempts: {
              orderBy: { submittedAt: 'desc' },
              take: 1
            },
            certifications: true
          }
        },
        course: { 
          include: {
            _count: { select: { lessons: true } }
          }
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // ANALYTICAL LOGIC: Group by Student and Sort by Top 10 (Most Enrollments)
    const studentMap = new Map();
    
    enrollments.forEach((e: any) => {
      const studentId = e.userId;
      if (!studentMap.has(studentId)) {
        // Redact email for security
        const sanitizedUser = { ...e.user };
        delete sanitizedUser.email;

        studentMap.set(studentId, {
          user: sanitizedUser,
          userId: studentId,
          enrollments: [],
          enrollmentCount: 0
        });
      }
      studentMap.get(studentId).enrollments.push(e);
      studentMap.get(studentId).enrollmentCount++;
    });

    const top10Basis = Array.from(studentMap.values())
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10);

    // ENRICHMENT: Fetch Global Membership and Instructor-Specific Investment
    const enrichedTop10 = await Promise.all(top10Basis.map(async (student: any) => {
      // 1. Global First Enrollment (Independiente del instructor)
      const earliestEnrollment = await prisma.enrollment.findFirst({
        where: { userId: student.userId },
        orderBy: { enrolledAt: 'asc' },
        select: { enrolledAt: true }
      });

      // 2. Total Investment specifically for this instructor
      const investmentAggregation = await prisma.transaction.aggregate({
        where: { 
          userId: student.userId, 
          instructorId: session.userId,
          paymentStatus: 'SUCCESS'
        },
        _sum: {
          grossAmount: true
        }
      });

      return {
        ...student,
        globalFirstEnrollment: earliestEnrollment?.enrolledAt || null,
        totalInstructorInvestment: Number(investmentAggregation._sum.grossAmount || 0)
      };
    }));

    return NextResponse.json(enrichedTop10);
  } catch (error) {
    console.error('Error fetching instructor enrollments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
