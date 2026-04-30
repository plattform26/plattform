import prisma from './prisma';
import { getCommissionPercentage } from './utils/commission';

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
export async function getEffectivePlan(userIdOrProfileId: string): Promise<PlanCapability | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: userIdOrProfileId },
        { instructorProfile: { id: userIdOrProfileId } }
      ]
    },
    include: {
      courtesyPlan: true,
      instructorProfile: {
        include: {
          subscriptions: {
            // No filtramos por status aquí para tener el historial del plan si no hay cortesía
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  if (!user) return null;

  // REGLA DE ORO: La comisión depende del PLAN, no de si se pagó la mensualidad o es cortesía.
  
  // 1. Caso Cortesía (Prioridad Alta)
  if (user.isCourtesy && user.courtesyPlan) {
    return {
      id: user.courtesyPlan.id,
      name: user.courtesyPlan.name,
      displayName: user.courtesyPlan.displayName,
      aiEnabled: user.courtesyPlan.aiEnabled,
      studentLimit: user.courtesyPlan.studentLimit,
      courseLimit: user.courtesyPlan.courseLimit,
      commissionRate: getCommissionPercentage(user.courtesyPlan.name), // 15% Starter, 10% Growth, 7% Scale
      expiresAt: null,
      status: 'COURTESY'
    };
  }

  // 2. Caso Suscripción de Stripe (Aunque esté CANCELLED, si es el último plan que tuvo)
  const lastSub = user.instructorProfile?.subscriptions[0];
  if (lastSub && lastSub.plan) {
    return {
      id: lastSub.plan.id,
      name: lastSub.plan.name,
      displayName: lastSub.plan.displayName,
      aiEnabled: lastSub.plan.aiEnabled,
      studentLimit: lastSub.plan.studentLimit,
      courseLimit: lastSub.plan.courseLimit,
      commissionRate: getCommissionPercentage(lastSub.plan.name), // 15% Starter, 10% Growth, 7% Scale
      expiresAt: lastSub.expiresAt,
      status: lastSub.status // Puede ser ACTIVE, CANCELLED, etc.
    };
  }

  return null;
}
