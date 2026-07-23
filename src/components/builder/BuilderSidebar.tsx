'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useBuilder } from '@/app/dashboard/instructor/courses/[id]/builder/layout';

export default function BuilderSidebar() {
  const { course, fetchCourse } = useBuilder();
  const { id: courseId } = useParams();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleModule = (modId: string) => {
    setCollapsed(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const addModule = async () => {
    const title = `Módulo ${course.modules.length + 1}`;
    const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, orderIndex: course.modules.length })
    });
    if (res.ok) fetchCourse();
  };

  const addLesson = async (modId: string) => {
    const mod = course.modules.find((m: any) => m.id === modId);
    const title = `Nueva Lección ${mod.lessons.length + 1}`;
    const res = await fetch(`/api/modules/${modId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, orderIndex: mod.lessons.length })
    });
    if (res.ok) fetchCourse();
  };

  const addModuleQuiz = async (modId: string) => {
    const mod = course.modules.find((m: any) => m.id === modId);
    const title = `Evaluación — ${mod.title}`;
    // Usamos fetch directo a nuestro endpoint de módulo
    const res = await fetch(`/api/modules/${modId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           title, 
           passingScore: 80, 
           totalScore: 100, 
           questions: [] 
        })
    });
    if (res.ok) fetchCourse();
  };

  return (
    <div className="py-4 space-y-1">
      <div className="px-4 mb-4">
         <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 italic">Estructura del Curso</h2>
         {course.modules.map((mod: any, index: number) => {
            const isCollapsed = collapsed[mod.id];
            const hasModuleQuiz = mod.lessons?.some((l: any) => l.contentType === 'QUIZ');
            return (
                <div key={mod.id} className="mb-2 group/module">
                   <div 
                     className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all"
                     onClick={() => toggleModule(mod.id)}
                   >
                      <span className={`text-[10px] text-gray-700 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                      <div className="flex-1 min-w-0">
                         <p className="text-[11px] font-bold text-gray-300 truncate uppercase tracking-tight">
                            Módulo {index + 1}: {mod.title}
                         </p>
                      </div>
                      <button 
                         onClick={(e) => { e.stopPropagation(); addLesson(mod.id); }}
                         className="opacity-0 group-hover/module:opacity-100 p-1 hover:text-cyan-400 text-[10px] font-black transition-opacity"
                         title="Agregar lección"
                      >
                         +
                      </button>
                   </div>

                   {!isCollapsed && (
                       <div className="ml-6 mt-1 space-y-1 border-l border-[#30363d]">
                          {mod.lessons.map((lesson: any) => {
                             const isActive = pathname.includes(`/lesson/${lesson.id}`) || pathname.includes(`/quiz/${lesson.id}`);
                             
                             if (lesson.contentType === 'QUIZ') {
                                 const quizQuestions = lesson.quiz?.questions?.length || 0;
                                 return (
                                    <Link 
                                        key={lesson.id}
                                        href={`/dashboard/instructor/courses/${courseId}/builder/quiz/${lesson.id}`}
                                        className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-r-lg border-l-2 transition-all ${
                                            isActive 
                                            ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                                            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }`}
                                    >
                                       <div className="flex items-center gap-3 min-w-0">
                                          <span className="text-xs shrink-0">📝</span>
                                          <span className="text-[11px] font-medium truncate">{lesson.title}</span>
                                       </div>
                                       <div className="flex flex-col items-end gap-1 shrink-0">
                                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400">
                                             MÓDULO
                                          </span>
                                          {quizQuestions === 0 ? (
                                              <span className="px-1 py-0.5 rounded text-[7px] font-black uppercase bg-red-500/20 text-red-400 flex items-center gap-1">
                                                 ⚠️ SIN CONFIGURAR
                                              </span>
                                          ) : (
                                              <span className="px-1 py-0.5 rounded text-[7px] font-black uppercase bg-green-500/20 text-green-400">
                                                 ✓ CONFIGURADO ({quizQuestions})
                                              </span>
                                          )}
                                       </div>
                                    </Link>
                                 );
                             }

                             return (
                                <Link 
                                    key={lesson.id}
                                    href={`/dashboard/instructor/courses/${courseId}/builder/lesson/${lesson.id}`}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-r-lg border-l-2 transition-all ${
                                        isActive 
                                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                >
                                   <span className="text-xs shrink-0">{lesson.contentType === 'VIDEO' ? '🎬' : '📄'}</span>
                                   <span className="text-[11px] font-medium truncate">{lesson.title}</span>
                                </Link>
                             );
                          })}
                          
                          {(mod.lessons.length === 0) && (
                              <p className="text-[9px] text-gray-700 italic px-4 py-2 uppercase tracking-tighter">Sin lecciones todavía</p>
                          )}

                          {(!hasModuleQuiz) && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); addModuleQuiz(mod.id); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-[#3B82F6] hover:text-blue-400 hover:bg-white/5 transition-colors uppercase tracking-widest rounded-r-lg border-l-2 border-transparent hover:border-blue-500/30"
                             >
                                <span className="text-xs shrink-0">📝</span> + Agregar evaluación de módulo
                             </button>
                          )}
                       </div>
                   )}
                </div>
            );
         })}

         <button 
            onClick={addModule}
            className="w-full mt-4 py-3 border-2 border-dashed border-[#30363d] rounded-2xl text-[10px] font-black text-gray-600 hover:border-cyan-500/40 hover:text-cyan-400 transition-all uppercase tracking-widest"
         >
            ➕ Nuevo Módulo
         </button>
      </div>

      <div className="px-4 pt-4 border-t border-[#30363d] mt-6 mb-6">
         <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 italic">Certificación Final</h2>
         {(() => {
             const finalQuiz = course.quizzes?.find((q: any) => !q.lessonId || q.lesson?.moduleId === null || course.modules.every((m: any) => !m.lessons.some((l: any) => l.id === q.lessonId)));
             const finalQuizQuestions = finalQuiz?.questions?.length || 0;

             return (
                 <Link 
                    href={`/dashboard/instructor/courses/${courseId}/builder/quiz`}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
                        pathname.includes('/builder/quiz') && !pathname.includes('/builder/quiz/')
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
                    }`}
                 >
                    <div className="flex items-center gap-3">
                       <span className="text-sm shrink-0">📝</span>
                       <span className="text-[11px] font-bold uppercase tracking-widest">Examen del Curso</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-400">
                           FINAL
                        </span>
                        {finalQuizQuestions === 0 ? (
                            <span className="px-1 py-0.5 rounded text-[7px] font-black uppercase bg-red-500/20 text-red-400 flex items-center gap-1">
                               ⚠️ SIN CONFIGURAR
                            </span>
                        ) : (
                            <span className="px-1 py-0.5 rounded text-[7px] font-black uppercase bg-green-500/20 text-green-400">
                               ✓ CONFIGURADO ({finalQuizQuestions})
                            </span>
                        )}
                    </div>
                 </Link>
             );
         })()}
      </div>
    </div>
  );
}
