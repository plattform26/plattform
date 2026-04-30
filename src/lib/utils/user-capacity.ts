import prisma from '@/lib/prisma';
import { getEffectivePlan } from '@/lib/plan-utils';

export interface UserCapacity {
  planName: string;
  courses: { used: number; limit: number | null };
  students: { used: number; limit: number | null };
  groups: { used: number; limit: number | null };
}

/**
 * Calcula la capacidad actual de un instructor basada en su plan y uso real de DB.
 */
export async function getUserCapacity(userId: string): Promise<UserCapacity> {
  // 1. Obtener el plan efectivo (Cortesía o Suscripción)
  const plan = await getEffectivePlan(userId);
  
  // 2. Conteo de Cursos (Activos)
  const coursesCount = await prisma.course.count({
    where: { 
      instructorId: userId, 
      deletedAt: null 
    }
  });

  // 3. Conteo de Alumnos Únicos
  // Obtenemos todos los alumnos inscritos en cualquier curso de este instructor
  const studentsCount = await prisma.enrollment.count({
    where: {
      course: {
        instructorId: userId
      },
      // Solo contamos alumnos con acceso activo
      status: { in: ['ACTIVE', 'COMPLETED'] }
    },
    // distinct: ['userId'] // Prisma support check
  });
  
  // Nota: Si distinct no funciona en el count de tu versión de Prisma, 
  // se puede usar groupBy o count directo si la lógica de enrollment garantiza 1 por curso.
  // Por ahora usamos el count de inscripciones totales como métrica de alumnos/cupos ocupados.

  return {
    planName: plan?.displayName || 'SIN PLAN',
    courses: { 
      used: coursesCount, 
      limit: plan?.courseLimit ?? null 
    },
    students: { 
      used: studentsCount, 
      limit: plan?.studentLimit ?? null 
    },
    groups: { 
      used: 0, // Placeholder para futura implementación
      limit: plan?.name === 'starter' ? 1 : (plan?.name === 'growth' ? 3 : null)
    }
  };
}
