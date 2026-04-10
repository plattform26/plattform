'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import BuilderSidebar from '@/components/builder/BuilderSidebar';

const BuilderContext = createContext<any>(null);
export const useBuilder = () => useContext(BuilderContext);

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const pathname = usePathname();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fetchCourse = async () => {
    const res = await fetch(`/api/instructor/courses/${courseId}/builder`);
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  if (loading) return <div className="h-screen bg-[#0b0e14] flex items-center justify-center text-cyan-500 font-mono text-xs animate-pulse uppercase tracking-[0.3em]">Inicializando Entorno de Construcción...</div>;
  if (!course) return <div className="h-screen bg-[#0b0e14] flex items-center justify-center text-red-500 font-bold">ERROR: CURSO NO ENCONTRADO</div>;

  // Validation logic for HUD (Misión: Relajar Restricciones)
  const hasIndex = (course.modules?.length || 0) > 0 && course.modules.some((m: any) => m.lessons?.length > 0);
  const hasQuizzes = (course.quizzes?.length || 0) > 0;
  // La imagen (thumbnailUrl) ya no es condición de bloqueo para isReady
  const isReady = course.title && course.description && Number(course.price) > 0 && hasIndex;

  const handlePublish = async () => {
    if (!isReady) {
        alert('Faltante: Debes configurar el Título, Descripción y tener contenido en los módulos antes de publicar.');
        return;
    }
    setPublishing(true);
    const res = await fetch(`/api/instructor/courses/${courseId}/publish`, { method: 'POST' });
    if (res.ok) {
        alert('🎉 ¡Curso publicado con éxito!');
        fetchCourse();
    }
    setPublishing(false);
  };

  return (
    <BuilderContext.Provider value={{ course, fetchCourse }}>
      <div className="flex h-screen bg-[#0b0e14] text-[#e6edf3] font-poppins overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-80 border-r border-[#30363d] bg-[#0d1117] flex flex-col shrink-0">
          <div className="p-6 border-b border-[#30363d]">
            <Link href="/dashboard/instructor/courses" className="text-[10px] font-black text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] mb-4 block">
              ← Mis Cursos
            </Link>
            <h1 className="text-sm font-bold text-white truncate">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${course.status === 'PUBLISHED' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{course.status}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <BuilderSidebar />
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER HUD */}
          <header className="h-20 border-b border-[#30363d] bg-[#161b22]/50 backdrop-blur-xl flex items-center justify-between px-8 z-30 shrink-0">
             <div className="flex-1 max-w-xl">
                <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                   <span>Progreso de Construcción</span>
                   <span className="text-cyan-400">{isReady ? '100%' : '75%'} Complicidad</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                   <div className="h-full bg-cyan-500 w-1/4"></div>
                   <div className={`h-full ${hasIndex ? 'bg-cyan-500' : 'bg-white/10'} w-1/4 transition-colors`}></div>
                   <div className={`h-full ${hasQuizzes ? 'bg-cyan-500' : 'bg-white/10'} w-1/4 transition-colors`}></div>
                   <div className={`h-full ${isReady ? 'bg-cyan-500' : 'bg-white/10'} w-1/4 transition-colors animate-pulse`}></div>
                </div>
             </div>

             <div className="flex items-center gap-4 ml-8">
                {(() => {
                    const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || course.lessons?.[0]?.id;
                    const previewUrl = firstLessonId 
                        ? `/dashboard/student/learn/${courseId}/lesson/${firstLessonId}?preview=true`
                        : `/courses/${course.slug}?preview=true`;
                    
                    return (
                        <Link 
                            href={previewUrl} 
                            target="_blank"
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                            👁️ Vista Previa
                        </Link>
                    );
                })()}
                <button 
                   onClick={handlePublish}
                   disabled={publishing || course.status === 'PUBLISHED'}
                   className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     course.status === 'PUBLISHED' 
                     ? 'bg-green-500/10 text-green-400 border border-green-400/20 cursor-default'
                     : 'bg-cyan-500 text-black hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20'
                   }`}
                >
                   {publishing ? '...' : course.status === 'PUBLISHED' ? '🎉 Publicado' : '🚀 Publicar Curso'}
                </button>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#0b0e14] p-10 custom-scrollbar relative">
             {children}
          </main>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </BuilderContext.Provider>
  );
}
