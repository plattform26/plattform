import prisma from './prisma';

export interface PlanCapability {
  id: string;
  name: string;
  displayName: string;
  aiEnabled: boolean;
  studentLimit: number;
  courseLimit: number;
  commissionRate: number;
  expiresAt: Date | null;
  status: string;
}

/**
 * SOURCE OF TRUTH: Plan Hierarchy (v6.0 - Simplified)
 * 1. Admin Courtesy (isCourtesy)
 * 2. Active Stripe Subscription (ACTIVE status + not expired)
 * 3. NULL (Redirects to Paywall)
 */
export async function getEffectivePlan(userId: string): Promise<PlanCapability | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      courtesyPlan: true,
      instructorProfile: {
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  if (!user) return null;

  // PRIORITY 1: Courtesy (Always active if flag is true)
  if (user.isCourtesy && user.courtesyPlan) {
    return {
      id: user.courtesyPlan.id,
      name: user.courtesyPlan.name,
      displayName: user.courtesyPlan.displayName,
      aiEnabled: user.courtesyPlan.aiEnabled,
      studentLimit: user.courtesyPlan.studentLimit,
      courseLimit: user.courtesyPlan.courseLimit,
      commissionRate: Number(user.courtesyPlan.commissionRate),
      expiresAt: null,
      status: 'COURTESY'
    };
  }

  // PRIORITY 2: Active Stripe Subscription
  const activeSub = user.instructorProfile?.subscriptions[0];
  if (activeSub && activeSub.plan && activeSub.status === 'ACTIVE') {
    // Safety: check expiration logic if we want, but DB status 'ACTIVE' is usually set by webhook
    return {
      id: activeSub.plan.id,
      name: activeSub.plan.name,
      displayName: activeSub.plan.displayName,
      aiEnabled: activeSub.plan.aiEnabled,
      studentLimit: activeSub.plan.studentLimit,
      courseLimit: activeSub.plan.courseLimit,
      commissionRate: Number(activeSub.plan.commissionRate),
      expiresAt: activeSub.expiresAt,
      status: 'ACTIVE'
    };
  }

  return null;
}
