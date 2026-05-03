'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import InstructorPreviewSidebar from '@/app/dashboard/instructor/components/InstructorPreviewSidebar';
import InstructorPreviewLessonHeader from '@/app/dashboard/instructor/components/InstructorPreviewLessonHeader';
import InstructorPreviewQuizViewer from '@/app/dashboard/instructor/components/InstructorPreviewQuizViewer';
import InstructorPreviewLessonNavigation from '@/app/dashboard/instructor/components/InstructorPreviewLessonNavigation';
import InlineLessonEditor from '@/components/InlineLessonEditor';

// Flag para activar nueva UI
const useNewPreviewUI = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_INSTRUCTOR_PREVIEW_UI === 'true';

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  moduleId: string;
  orderIndex: number;
  contentText?: string;
  videoUrl?: string;
  contentType: 'TEXT' | 'VIDEO' | 'QUIZ';
  quiz?: Quiz;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  passingScore?: number;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
}

interface Option {
  id: string;
  optionText: string;
}

interface PreviewPageProps {
  params: Promise<{
    id: string; // courseId
  }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { id: courseId } = use(params);
  const [courseData, setCourseData] = useState<{
    id: string;
    title: string;
    instructor?: { name: string };
    modules: Module[];
  } | null>(null);
  
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del curso
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/instructor/courses/${courseId}/preview`);
        if (!response.ok) throw new Error('No se pudo cargar el curso');
        
        const data = await response.json();
        setCourseData(data);
        
        // Establecer primera lección si no hay una seleccionada
        if (data.modules && data.modules.length > 0) {
          const firstLesson = data.modules[0].lessons[0];
          if (firstLesson) {
            setCurrentLessonId(firstLesson.id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#080e1c] text-white">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-space-grotesk font-bold uppercase tracking-widest text-xs animate-pulse">Cargando Engine de Preview...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-[#080e1c] text-red-400">
      <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-3xl">
         <p className="text-4xl mb-4">⚠️</p>
         <p className="font-bold uppercase tracking-widest text-sm">{error}</p>
      </div>
    </div>
  );

  if (!courseData) return notFound();

  // Obtener lección actual
  const currentLesson = courseData.modules
    .flatMap(m => m.lessons)
    .find(l => l.id === currentLessonId);

  if (!currentLesson) return (
    <div className="flex items-center justify-center h-screen bg-[#080e1c] text-gray-500">
       <p className="font-bold uppercase tracking-widest text-xs italic">Selecciona una lección para comenzar</p>
    </div>
  );

  // Calcular índices para navegación
  const allLessons = courseData.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const moduleOfCurrentLesson = courseData.modules.find(m => 
    m.lessons.some(l => l.id === currentLessonId)
  );

  // Handlers para navegación
  const handleLessonChange = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    // Scroll to top of main area
    const mainArea = document.querySelector('main > div');
    if (mainArea) mainArea.scrollTo(0, 0);
  };

  const handlePreviousClick = () => {
    if (previousLesson) {
      handleLessonChange(previousLesson.id);
    }
  };

  const handleNextClick = () => {
    if (nextLesson) {
      handleLessonChange(nextLesson.id);
    }
  };

  // SI está habilitada la nueva UI
  if (useNewPreviewUI) {
    return (
      <InstructorPreviewSidebar
        modules={courseData.modules.map(mod => ({
          id: mod.id,
          title: mod.title,
          lessons: mod.lessons.map(l => ({
            id: l.id,
            title: l.title,
            moduleId: mod.id,
            order: l.orderIndex
          }))
        }))}
        currentLessonId={currentLessonId!}
        onLessonChange={handleLessonChange}
      >
        <div className="max-w-4xl mx-auto px-6 py-12">
          <InstructorPreviewLessonHeader
            lessonTitle={currentLesson.title}
            moduleTitle={moduleOfCurrentLesson?.title || 'Módulo'}
            lessonNumber={currentIndex + 1}
            subtitle={currentLesson.subtitle}
          />

          {/* Contenido de la lección */}
          <div className="space-y-12">
            {/* Video */}
            {currentLesson.videoUrl && (
              <div className="card !p-0 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] border-cyan-500/20">
                 <div className="video-container">
                    <iframe 
                       src={currentLesson.videoUrl.replace('watch?v=', 'embed/')} 
                       allow="autoplay; fullscreen; picture-in-picture" 
                       allowFullScreen
                    ></iframe>
                 </div>
              </div>
            )}

            {/* Contenido de texto */}
            {currentLesson.contentText && (
              <section className="card prose prose-invert prose-cyan max-w-none shadow-2xl">
                <div dangerouslySetInnerHTML={{ __html: currentLesson.contentText }} />
              </section>
            )}

            {/* Quiz */}
            {currentLesson.contentType === 'QUIZ' && currentLesson.quiz && (
              <InstructorPreviewQuizViewer
                quiz={{
                  id: currentLesson.quiz.id,
                  title: currentLesson.quiz.title,
                  questions: currentLesson.quiz.questions.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    options: q.options.map(o => ({
                      id: o.id,
                      optionText: o.optionText
                    }))
                  }))
                }}
                courseTitle={courseData.title}
              />
            )}
          </div>

          {/* Navegación */}
          <InstructorPreviewLessonNavigation
            prevLesson={previousLesson}
            nextLesson={nextLesson}
            onPreviousClick={handlePreviousClick}
            onNextClick={handleNextClick}
          />

          {/* Editor Inline */}
          <div className="mt-20 border-t border-white/5 pt-10">
             <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Editor de Instructor</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
             </div>
             <InlineLessonEditor 
               lesson={{ 
                 id: currentLesson.id, 
                 title: currentLesson.title, 
                 subtitle: currentLesson.subtitle, 
                 content: currentLesson.contentText, 
                 videoUrl: currentLesson.videoUrl, 
                 contentType: currentLesson.contentType 
               }} 
             />
          </div>
        </div>
      </InstructorPreviewSidebar>
    );
  }

  // Fallback UI antigua
  return (
    <div className="flex items-center justify-center h-screen bg-[#080e1c] text-white">
       <div className="text-center">
          <p className="text-4xl mb-6">🛸</p>
          <h2 className="font-space-grotesk font-black text-2xl uppercase italic tracking-tighter mb-2">Engine de Preview</h2>
          <p className="text-gray-500 text-xs uppercase tracking-widest">Activa NEXT_PUBLIC_INSTRUCTOR_PREVIEW_UI para ver la nueva interfaz</p>
       </div>
    </div>
  );
}
