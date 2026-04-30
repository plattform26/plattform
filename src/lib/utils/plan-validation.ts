import prisma from '@/lib/prisma';
import { getEffectivePlan } from '@/lib/plan-utils';

export interface ValidationResult {
  allowed: boolean;
  message?: string;
  current?: number;
  limit?: number | null;
}

/**
 * Valida si un instructor puede crear un nuevo curso basado en su plan.
 */
export async function validateCourseLimit(userId: string): Promise<ValidationResult> {
  const plan = await getEffectivePlan(userId);
  
  if (!plan) {
    return { 
      allowed: false, 
      message: 'No se encontró un plan activo para tu cuenta.' 
    };
  }

  // Límite ilimitado
  if (plan.courseLimit === -1 || plan.courseLimit === null) {
    return { allowed: true };
  }

  // Conteo de cursos actuales (excluyendo eliminados)
  const currentCourses = await prisma.course.count({
    where: { 
      instructorId: userId,
      deletedAt: null 
    }
  });

  if (currentCourses >= plan.courseLimit) {
    return {
      allowed: false,
      current: currentCourses,
      limit: plan.courseLimit,
      message: `Has alcanzado el límite de ${plan.courseLimit} cursos permitidos por tu plan ${plan.displayName}.`
    };
  }

  return { 
    allowed: true, 
    current: currentCourses, 
    limit: plan.courseLimit 
  };
}
