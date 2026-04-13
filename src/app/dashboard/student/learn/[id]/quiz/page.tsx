import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import QuizViewer from '../lesson/[lessonId]/QuizViewer';
import Link from 'next/link';

export default async function FinalQuizPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Buscar el quiz final del curso (el que no tiene lección asociada, o el primero del curso)
  const quiz = await prisma.quiz.findFirst({
    where: { 
      courseId: params.id,
      lessonId: null 
    },
    include: {
      questions: { 
        include: { options: { orderBy: { orderIndex: 'asc' } } },
        orderBy: { orderIndex: 'asc' } 
      },
      course: true
    }
  });

  // Si no hay quiz sin lección, buscamos CUALQUIER quiz del curso como fallback
  const finalQuiz = quiz || await prisma.quiz.findFirst({
    where: { courseId: params.id },
    include: {
      questions: { 
        include: { options: { orderBy: { orderIndex: 'asc' } } },
        orderBy: { orderIndex: 'asc' } 
      },
      course: true
    }
  });

  // Buscar intentos previos del alumno para este quiz
  const initialAttempt = finalQuiz ? await prisma.quizAttempt.findFirst({
    where: { 
      userId: session.userId,
      quizId: finalQuiz.id
    },
    include: { certification: true },
    orderBy: { submittedAt: 'desc' }
  }) : null;

  // Buscar si el alumno ya calificó el curso
  const userRatingRecord = await prisma.courseRating.findFirst({
    where: { courseId: params.id, userId: session.userId },
    select: { rating: true }
  });
  const userRating = userRatingRecord?.rating || null;

  if (!finalQuiz) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">🏆 ¡Has completado todas las lecciones!</h1>
        <p className="text-gray-400 mb-8">Este curso no tiene una evaluación final configurada actualmente.</p>
        <Link href="/dashboard/student" className="px-8 py-3 bg-cyan-500 text-black font-black rounded-xl uppercase tracking-widest">
           Volver a mis cursos
        </Link>
      </div>
    );
  }

  // Saneamiento Radical: Convertir a objeto plano para evitar errores de Decimal
  const sanitizedQuiz = JSON.parse(JSON.stringify(finalQuiz));
  const sanitizedAttempt = initialAttempt ? JSON.parse(JSON.stringify(initialAttempt)) : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
         <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Evaluación Final</span>
         <h1 className="text-4xl md:text-6xl font-space-grotesk font-black mb-6 text-white uppercase tracking-tighter italic">
            {finalQuiz.title}
         </h1>
         <p className="text-xl text-gray-400 font-light leading-relaxed mb-8">
            Demuestra lo aprendido en <b>{finalQuiz.course.title}</b>.
         </p>
         <div className="h-1 w-32 bg-amber-500 mx-auto rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
      </header>

      <div className="card shadow-2xl shadow-amber-500/5 border-amber-500/10">
        <QuizViewer 
           quiz={sanitizedQuiz} 
           courseId={params.id} 
           lessonId="" 
           userId={session.userId}
           studentName={`${session.name} ${session.lastName || ''}`}
           initialAttempt={sanitizedAttempt}
           userRating={userRating}
        />
      </div>

      <div className="mt-12 text-center">
        <Link href={`/dashboard/student/learn/${params.id}`} className="text-gray-500 hover:text-white text-xs transition-colors">
          ← Volver a las lecciones
        </Link>
      </div>
    </div>
  );
}
