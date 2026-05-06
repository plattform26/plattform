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
    const allTransactions = await prisma.transaction.findMany({
      where: { 
          instructorId: userId,
          paymentStatus: 'SUCCESS',
          paymentType: 'COURSE_PURCHASE'
      },
      select: {
        grossAmount: true,
        platformCommissionAmount: true,
        netAmountToInstructor: true,
        stripeFeeAmount: true,
        createdAt: true
      }
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let totalSales = 0;
    let totalCommission = 0;
    let netEarnings = 0;
    let monthlyGross = 0;
    let monthlyNet = 0;

    allTransactions.forEach(tx => {
      const gross = Number(tx.grossAmount || 0);
      const commission = Number(tx.platformCommissionAmount || 0);
      const net = Number(tx.netAmountToInstructor || 0);
      
      // Cálculo del neto real (restando fee de Stripe + IVA si no está en la DB)
      let realNet = net;
      if (tx.stripeFeeAmount === null && gross > 0) {
        const estimatedFee = ((gross * 0.036) + 3) * 1.16;
        realNet = net - estimatedFee;
      }

      totalSales += gross;
      totalCommission += commission;
      netEarnings += realNet;

      if (tx.createdAt >= startOfMonth) {
        monthlyGross += gross;
        monthlyNet += realNet;
      }
    });

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

    const { getEffectivePlan } = await import('@/lib/plan-utils');
    const effectivePlan = await getEffectivePlan(userId);

    return NextResponse.json({
        profile,
        activeSub,
        effectivePlan,
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
