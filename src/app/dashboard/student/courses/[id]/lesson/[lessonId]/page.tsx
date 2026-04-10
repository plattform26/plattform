'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QuizViewer from './QuizViewer';

export default function StudentLessonPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const [lRes, cRes] = await Promise.all([
            fetch(`/api/lessons/${lessonId}`),
            fetch(`/api/courses/${courseId}`)
        ]);
        const [lData, cData] = await Promise.all([lRes.json(), cRes.json()]);
        setLesson(lData);
        setCourse(cData);
        setLoading(false);
    };
    fetchData();
  }, [lessonId, courseId]);

  if (loading) return <div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Sincronizando Aula...</div>;

  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      {/* NAVBAR SUPERIOR */}
      <nav className="sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-xl border-b border-[#30363d] px-8 py-4 flex justify-between items-center">
        <Link href={`/dashboard/student/courses/${courseId}`} className="text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2">
           ← {course?.title || 'Volver al Curso'}
        </Link>
        <div className="flex items-center gap-6">
            <div className="h-1 lg:w-40 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: '45%' }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Progreso: 45%</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-6 animate-fade-in">
        <header className="mb-12">
            <span className="bg-blue-600/10 text-blue-400 border border-blue-600/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6 inline-block">
                {lesson.contentType === 'QUIZ' ? 'Fase de Evaluación' : 'Unidad de Aprendizaje'}
            </span>
            <h1 className="text-5xl font-space-grotesk font-black text-white leading-tight">{lesson.title}</h1>
            <p className="text-gray-500 text-lg mt-4 font-light italic">{lesson.subtitle || 'Prepárate para profundizar en este módulo.'}</p>
        </header>

        {/* CONTENIDO SEGÚN TIPO */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-[40px] overflow-hidden shadow-2xl relative">
            {lesson.contentType === 'VIDEO' && lesson.videoUrl && (
                <div className="aspect-video bg-black">
                    <iframe 
                        src={lesson.videoUrl.replace('watch?v=', 'embed/')} 
                        className="w-full h-full"
                        frameBorder="0" 
                        allowFullScreen 
                    />
                </div>
            )}

            {lesson.contentType === 'TEXT' && (
                <div className="p-12 prose prose-invert max-w-none text-lg text-gray-300 leading-relaxed font-light" 
                     dangerouslySetInnerHTML={{ __html: lesson.contentText }} 
                />
            )}

            {lesson.contentType === 'QUIZ' && lesson.quiz && (
                <div className="p-12">
                    <QuizViewer 
                      quizId={lesson.quiz.id} 
                      courseId={courseId as string} 
                    />
                </div>
            )}
        </section>

        <footer className="mt-16 flex justify-between items-center pt-8 border-t border-[#30363d]">
            <div className="flex gap-4">
                <button className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all">← Lección Anterior</button>
            </div>
            <Link href={`/dashboard/student/courses/${courseId}`} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all">
                Cerrar Aula
            </Link>
            <button 
                onClick={() => router.push(`/dashboard/student/courses/${courseId}/lesson/next`)}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
                Siguiente Lección →
            </button>
        </footer>
      </main>

      <style jsx global>{`
           .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
           .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
           @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
           @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
           .prose h2 { color: white; font-family: 'Space Grotesk', sans-serif; font-weight: 900; font-size: 2rem; margin-top: 3rem; }
           .prose p { color: #8b949e; line-height: 1.8; }
       `}</style>
    </div>
  );
}
