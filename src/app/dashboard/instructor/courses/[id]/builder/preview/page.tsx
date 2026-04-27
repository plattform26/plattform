import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';

export default async function BuilderPreviewPage(
  props: { 
    params: Promise<{ id: string }> 
  }
) {
  const params = await props.params;
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  // Buscar la primera lección del curso para previsualizar
  const firstLesson = await prisma.courseLesson.findFirst({
    where: { courseId: params.id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true }
  });

  if (!firstLesson) {
    // Si no hay lecciones, mostrar un aviso o redirigir al builder
    redirect(`/dashboard/instructor/courses/${params.id}/builder`);
  }

  // Redirigir a la vista de aula del alumno pero con una marca de preview
  // NOTA: El componente del aula deberá detectar este rol para ocultar el marcado de progreso real
  redirect(`/dashboard/instructor/courses/${params.id}/preview/lesson/${firstLesson.id}`);
}
