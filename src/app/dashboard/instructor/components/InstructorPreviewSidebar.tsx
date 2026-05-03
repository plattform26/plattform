'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  isCompleted?: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface InstructorPreviewSidebarProps {
  courseId: string;
  modules: Module[];
  currentLessonId: string;
  children: ReactNode;
}

export default function InstructorPreviewSidebar({
  courseId,
  modules,
  currentLessonId,
  children
}: InstructorPreviewSidebarProps) {
  return (
    <div className="flex h-screen bg-[#080e1c] text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[258px] h-full bg-[#050b16] border-r border-blue-500/10 flex flex-col transition-all duration-300 overflow-hidden relative z-50">
        <div className="p-6 border-b border-blue-500/10 flex flex-col gap-4">
           <Link href="/dashboard/instructor/courses" className="text-[10px] uppercase font-bold text-gray-500 hover:text-cyan-400 transition-colors">
              ← Volver al panel
           </Link>
           <div className="px-5 py-2 bg-green-500/20 border border-green-500/50 text-green-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl text-center">
              MODO PREVIEW
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          {modules.map(module => (
            <div key={module.id} className="space-y-1">
              {/* Título del módulo */}
              <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-600 tracking-widest">
                {module.title}
              </div>

              {/* Lecciones del módulo */}
              <div className="space-y-0.5">
                {module.lessons.map(lesson => {
                  const isActive = currentLessonId === lesson.id;
                  return (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/instructor/courses/${courseId}/preview/lesson/${lesson.id}`}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all
                        ${isActive
                          ? 'bg-blue-600/10 text-cyan-400 border border-blue-500/10'
                          : 'text-gray-400 hover:bg-blue-500/5 hover:text-white'
                        }
                      `}
                    >
                      <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] border ${
                        isActive ? 'border-cyan-500 text-cyan-400' : 'border-gray-700 text-gray-600'
                      }`}>
                        {isActive ? '▶' : '○'}
                      </span>
                      <span className="flex-1 truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#080e1c] relative">
         <header className="h-16 flex items-center justify-between px-6 border-b border-blue-500/10 bg-[#080e1c]/80 backdrop-blur-md sticky top-0 z-40">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
               Preview: Plattform Learning Engine
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold text-amber-500 uppercase animate-pulse">Vista de Instructor</span>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
         </div>
      </main>
    </div>
  );
}
