import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import LessonClient from './LessonClient';
import QuizViewer from './QuizViewer';

function getEmbedUrl(url: string) {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1].split('?')[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
}

export default async function LessonPage({ 
  params 
}: { 
  params: { id: string; lessonId: string } 
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const rawLesson = await prisma.courseLesson.findUnique({
    where: { id: params.lessonId },
    include: {
      quiz: {
        include: {
          questions: { 
            include: { options: { orderBy: { orderIndex: 'asc' } } },
            orderBy: { orderIndex: 'asc' } 
          }
        }
      },
      module: true
    }
  });


  // FIX: Nodo Perdido - Si la lección no existe, ir a la primera del curso
  if (!rawLesson || rawLesson.courseId !== params.id) {
    const firstLesson = await prisma.courseLesson.findFirst({
      where: { courseId: params.id },
      orderBy: [
        { module: { orderIndex: 'asc' } },
        { orderIndex: 'asc' }
      ],
      select: { id: true }
    });

    if (firstLesson) {
      redirect(`/dashboard/student/learn/${params.id}/lesson/${firstLesson.id}`);
    }
    
    // Si no hay ninguna lección, mostrar 404 o mensaje de 'Crear Lección'
    return notFound();
  }

  const lesson = rawLesson as any;

  // Buscar lecciones anterior y siguiente
  const allLessons = await prisma.courseLesson.findMany({
    where: { courseId: params.id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, title: true }
  });

  const currentIndex = allLessons.findIndex((l: any) => l.id === lesson.id);
  const prevLesson = allLessons[currentIndex - 1] || null;
  const nextLesson = allLessons[currentIndex + 1] || null;

  const progressRecord = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: session.userId, lessonId: lesson.id } }
  });

  const isCompleted = progressRecord?.completed || false;
  const isPreview = session.role === 'INSTRUCTOR';

  return (
    <div className="relative">
      {isPreview && (
        <div className="bg-cyan-500 text-black py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] sticky top-0 z-[100] shadow-xl">
           ⚡ MODO PREVIEW — Vista Maestra de Instructor — Sin Guardado de Progreso Real ⚡
        </div>
      )}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* HEADER DE LA LECCIÓN */}
        <header className="mb-12 text-center">
           <span className="module-tag">
              Módulo {lesson.module?.orderIndex || 0}: {lesson.module?.title}
           </span>
           <h1 className="text-4xl md:text-6xl font-space-grotesk font-black mb-6 text-cyan-400 uppercase tracking-tighter italic">
              {lesson.title}
           </h1>
           {lesson.subtitle && (
             <p className="text-xl text-gray-400 font-light leading-relaxed mb-8 italic">
               "{lesson.subtitle}"
             </p>
           )}
           <div className="h-1 w-32 bg-cyan-500 mx-auto rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div className="space-y-12">
          {/* VIDEO (Si existe) */}
          {lesson.videoUrl && (
            <div className="card !p-0 overflow-hidden">
               <div className="video-container">
                  <iframe 
                     src={getEmbedUrl(lesson.videoUrl)} 
                     allow="autoplay; fullscreen; picture-in-picture" 
                     allowFullScreen
                  ></iframe>
               </div>
            </div>
          )}

          {/* TEXTO O QUIZ */}
          <section className="card prose prose-invert prose-cyan max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-h2:text-cyan-400 prose-h2:font-space-grotesk prose-strong:text-cyan-400">
              {lesson.contentType === 'QUIZ' && lesson.quiz ? (
                await (async () => {
                  const latestAttempt = await prisma.quizAttempt.findFirst({
                    where: { userId: session.userId, quizId: lesson.quiz.id },
                    orderBy: { attemptNumber: 'desc' },
                    include: { certification: true }
                  });

                  // BINDING_FIX: Saneamiento Radical en el Server Component
                  // Se reconstruye el objeto quiz para OMITIR campos legacy (optionsJson, correctAnswer)
                  // Esto garantiza que el componente Cliente reciba datos limpios.
                  const sanitizedQuizRaw = {
                    ...lesson.quiz,
                    questions: (lesson.quiz.questions as any[]).map(q => ({
                      id: q.id,
                      quizId: q.quizId,
                      questionText: q.questionText,
                      questionType: q.questionType,
                      points: q.points,
                      orderIndex: q.orderIndex,
                      options: q.options // Única fuente autorizada
                    }))
                  };

                  // Blindaje de Serialización: Convertir a objeto plano
                  const sanitizedQuiz = JSON.parse(JSON.stringify(sanitizedQuizRaw));
                  const sanitizedAttempt = latestAttempt ? JSON.parse(JSON.stringify(latestAttempt)) : null;

                  return (
                    <QuizViewer 
                       quiz={sanitizedQuiz} 
                       courseId={params.id} 
                       lessonId={params.lessonId}
                       userId={session.userId}
                       studentName={`${session.name} ${session.lastName || ''}`}
                       initialAttempt={sanitizedAttempt}
                    />
                  );
                })()
              ) : (
                <div 
                  dangerouslySetInnerHTML={{ __html: lesson.contentText }} 
                  className="text-lg space-y-6"
                />
              )}
          </section>

          {/* DID YOU KNOW / PUNTOS CLAVE */}
          {lesson.contentType !== 'QUIZ' && (lesson.summary || lesson.funFact) && (
             <div className="did-you-know space-y-4">
                {lesson.summary && (
                  <div>
                    <b className="text-cyan-400 uppercase tracking-widest text-[10px] block mb-1 font-black underline decoration-cyan-500/30 underline-offset-4">Puntos Clave</b>
                    <p className="text-sm text-gray-300 leading-relaxed font-light">
                      {lesson.summary}
                    </p>
                  </div>
                )}
                {lesson.funFact && (
                  <div>
                    <b className="text-cyan-400 uppercase tracking-widest text-[10px] block mb-1 font-black underline decoration-cyan-500/30 underline-offset-4 font-space-grotesk italic">¿Sabías que?</b>
                    <p className="text-sm text-gray-400 leading-relaxed italic opacity-80">
                      {lesson.funFact}
                    </p>
                  </div>
                )}
             </div>
          )}
        </div>

      {/* FOOTER NAVEGACIÓN */}
      <div className="mt-20">
        <LessonClient 
          courseId={params.id} 
          lessonId={params.lessonId} 
          prevLesson={prevLesson} 
          nextLesson={nextLesson}
          isCompletedInitial={isCompleted}
          userRole={session.role}
        />
      </div>
      </div>
    </div>
  );
}
