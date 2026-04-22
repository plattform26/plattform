export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Identify target instructor (from session if INSTRUCTOR, from query if ADMIN)
    const { searchParams } = new URL(req.url);
    const userId = session.role === 'ADMIN' ? (searchParams.get('userId') || session.userId) : session.userId;

    const profile = await prisma.instructorProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'PAUSED'] } },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    // --- AUTOMATED STRIPE SYNC ---
    if (profile.stripeConnectId && !profile.stripeOnboardingComplete) {
      try {
        const { stripe } = await import('@/lib/stripe');
        const account = await stripe.accounts.retrieve(profile.stripeConnectId);
        
        if (account.details_submitted) {
          await prisma.instructorProfile.update({
            where: { id: profile.id },
            data: { stripeOnboardingComplete: true }
          });
          profile.stripeOnboardingComplete = true;
        }
      } catch (stripeError) {
        console.error('Silently failed to sync with Stripe:', stripeError);
      }
    }

    const activeSub = profile.subscriptions[0];
    const monthlyRent = Number(activeSub?.plan.monthlyPrice || 0);

    // Calc Next Billing/Expiration
    let expirationDate = activeSub?.expiresAt || (activeSub?.startedAt ? new Date(new Date(activeSub.startedAt).setMonth(new Date(activeSub.startedAt).getMonth() + 1)) : null);
    
    // Si hay cortesía, ignoramos el vencimiento del plan pagado para efectos de visualización primaria
    if (profile.user.isCourtesy) {
      expirationDate = null;
    }

    // Lifetime Aggregations
    const aggregations = await prisma.transaction.aggregate({
      where: { 
          instructorId: userId,
          paymentStatus: 'SUCCESS',
          paymentType: 'COURSE_PURCHASE'
      },
      _sum: {
        grossAmount: true,
        platformCommissionAmount: true,
        netAmountToInstructor: true,
      }
    });

    const totalSales = Number(aggregations._sum.grossAmount || 0);
    const totalCommission = Number(aggregations._sum.platformCommissionAmount || 0);
    const netEarnings = Number(aggregations._sum.netAmountToInstructor || 0);

    // Monthly Aggregations
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyAggregations = await prisma.transaction.aggregate({
      where: { 
          instructorId: userId,
          paymentStatus: 'SUCCESS',
          paymentType: 'COURSE_PURCHASE',
          createdAt: { gte: startOfMonth }
      },
      _sum: {
        grossAmount: true,
        netAmountToInstructor: true,
      }
    });

    const monthlyGross = Number(monthlyAggregations._sum.grossAmount || 0);
    const monthlyNet = Number(monthlyAggregations._sum.netAmountToInstructor || 0);

    // Transactions Log
    const transactions = await prisma.transaction.findMany({
      where: { 
          instructorId: userId,
          paymentStatus: 'SUCCESS',
          paymentType: 'COURSE_PURCHASE'
      },
      include: { 
        course: { select: { title: true } }, 
        user: { select: { name: true, lastName: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Breakdown by Course
    const coursesWithStudents = await prisma.course.findMany({
      where: { instructorId: userId, deletedAt: null },
      include: {
          _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
        profile,
        activeSub,
        monthlyRent,
        expirationDate,
        totalSales,
        totalCommission,
        netEarnings,
        monthlyGross,
        monthlyNet,
        coursesWithStudents,
        transactions
    });
  } catch (error) {
    console.error('Finances API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
