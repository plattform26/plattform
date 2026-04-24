import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LearnCourseRedirect(
  props: { 
    params: Promise<{ id: string }> 
  }
) {
  const params = await props.params;
  const session = await getSession();
  if (!session) redirect('/login');

  // Buscar la primera lección válida (módulo y lección con orderIndex más bajo)
  const modules = await prisma.courseModule.findMany({
    where: { courseId: params.id },
    orderBy: { orderIndex: 'asc' },
    include: {
      lessons: {
        orderBy: { orderIndex: 'asc' },
        take: 1
      }
    }
  });

  const firstModule = modules[0];
  const firstLesson = firstModule?.lessons[0];

  if (firstLesson) {
    redirect(`/dashboard/student/learn/${params.id}/lesson/${firstLesson.id}`);
  }

  // Si no hay lecciones, mostrar un error amigable o redirigir al catálogo
  redirect('/dashboard/student/courses');
}
