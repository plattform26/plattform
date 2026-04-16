import prisma from './prisma';

export interface PlanCapability {
  id: string;
  name: string;
  displayName: string;
  aiEnabled: boolean;
  studentLimit: number;
  courseLimit: number;
  commissionRate: number;
}

/**
 * SOURCE OF TRUTH: Plan Hierarchy (v5.0)
 * 1. Admin Courtesy (manualPlan)
 * 2. Active Stripe Subscription
 * 3. STARTER Fallback
 */
export async function getEffectivePlan(userId: string): Promise<PlanCapability | null> {
  // 1. Check User for Courtesy
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      courtesyPlan: true,
      instructorProfile: {
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1
          }
        }
      }
    }
  });

  if (!user) return null;

  // PRIORITY 1: Courtesy
  if (user.isCourtesy && user.courtesyPlan) {
    return {
      id: user.courtesyPlan.id,
      name: user.courtesyPlan.name,
      displayName: user.courtesyPlan.displayName,
      aiEnabled: user.courtesyPlan.aiEnabled,
      studentLimit: user.courtesyPlan.studentLimit,
      courseLimit: user.courtesyPlan.courseLimit,
      commissionRate: Number(user.courtesyPlan.commissionRate)
    };
  }

  // PRIORITY 2: Active Stripe Subscription
  const activeSub = user.instructorProfile?.subscriptions[0];
  if (activeSub && activeSub.plan) {
    return {
      id: activeSub.plan.id,
      name: activeSub.plan.name,
      displayName: activeSub.plan.displayName,
      aiEnabled: activeSub.plan.aiEnabled,
      studentLimit: activeSub.plan.studentLimit,
      courseLimit: activeSub.plan.courseLimit,
      commissionRate: Number(activeSub.plan.commissionRate)
    };
  }

  // PRIORITY 3: STARTER Fallback (Reversión Automática)
  const starterPlan = await prisma.platformPlan.findFirst({
    where: { 
      OR: [
        { name: 'STARTER' },
        { name: 'starter' },
        { displayName: { contains: 'Starter' } }
      ]
    }
  });

  if (starterPlan) {
    return {
      id: starterPlan.id,
      name: starterPlan.name,
      displayName: starterPlan.displayName,
      aiEnabled: starterPlan.aiEnabled,
      studentLimit: starterPlan.studentLimit,
      courseLimit: starterPlan.courseLimit,
      commissionRate: Number(starterPlan.commissionRate)
    };
  }

  return null;
}
