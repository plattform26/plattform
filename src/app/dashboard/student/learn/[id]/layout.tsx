import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarClient from './SidebarClient';

export default async function ClassroomLayout(
  props: { 
    children: React.ReactNode; 
    params: Promise<{ id: string }> 
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const session = await getSession();
  if (!session) redirect('/login');

  const isInstructorOrAdmin = session.role === 'INSTRUCTOR' || session.role === 'ADMIN';

  if (!isInstructorOrAdmin && session.role !== 'STUDENT') {
    redirect('/dashboard/student/courses');
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId: params.id } },
  });

  if (!isInstructorOrAdmin && (!enrollment || enrollment.status !== 'ACTIVE')) {
    redirect('/dashboard/student/courses');
  }

  const courseData = await prisma.course.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      modules: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              orderIndex: true
            }
          }
        }
      }
    }
  });

  if (!courseData) redirect('/dashboard/student/courses');

  // Sanitización Radical: Convertir a objeto plano para evitar errores de Decimal y optimizar transferencia
  const course = JSON.parse(JSON.stringify(courseData));

  const progress = await prisma.progress.findMany({
    where: { userId: session.userId, courseId: params.id, completed: true },
    select: { lessonId: true }
  });

  // SHIELD: Incluir también lecciones cuyos quizzes hayan sido aprobados
  const passedQuizAttempts = await prisma.quizAttempt.findMany({
    where: { 
      userId: session.userId, 
      courseId: params.id,
      passed: true,
      quiz: { lessonId: { not: null } }
    },
    select: { quiz: { select: { lessonId: true } } }
  });

  const quizCompletedLessonIds = passedQuizAttempts
    .map((a: any) => a.quiz?.lessonId)
    .filter(Boolean);

  const completedLessonIds = Array.from(new Set([
    ...progress.map((p: any) => p.lessonId),
    ...quizCompletedLessonIds
  ]));

  const totalLessons = course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;

  return (
    <div className="flex h-screen bg-[#080e1c] text-white overflow-hidden">
      {/* Sidebar Client-Side for collapse logic */}
      <SidebarClient 
        course={course} 
        completedLessonIds={completedLessonIds} 
        progressPercent={progressPercent}
        courseId={params.id}
        userRole={session.role}
      >
        {children}
      </SidebarClient>
    </div>
  );
}
