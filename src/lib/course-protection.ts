import prisma from './prisma';

/**
 * Verifica si un curso está "bloqueado para edición" (Seguridad en Producción).
 * Regla: Bloqueo total si estado === "PUBLISHED" Y alumnos_inscritos > 0.
 * Excepción: Los administradores (ADMIN) pueden saltarse este bloqueo.
 */
export async function isCourseLocked(courseId: string, userRole?: string): Promise<{ locked: boolean; reason?: string }> {
  // Los administradores tienen la "Llave Maestra"
  if (userRole === 'ADMIN') {
    return { locked: false };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      status: true,
      _count: {
        select: { enrollments: true }
      }
    }
  });

  if (!course) {
    return { locked: false }; // Si no existe, no está bloqueado (se manejará el error 404 en el endpoint)
  }

  const hasEnrollments = course._count.enrollments > 0;
  const isPublished = course.status === 'PUBLISHED';

  if (isPublished && hasEnrollments) {
    return {
      locked: true,
      reason: 'Edición bloqueada: El curso está en producción y con alumnos activos. Para realizar cambios estructurales, duplica el curso (requiere Plan Scale) o contacta a soporte.'
    };
  }

  return { locked: false };
}
