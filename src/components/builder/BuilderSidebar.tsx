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

  return (
    <div className="py-4 space-y-1">
      <div className="px-4 mb-4">
         <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 italic">Estructura del Curso</h2>
         {course.modules.map((mod: any, index: number) => {
            const isCollapsed = collapsed[mod.id];
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
                             const isActive = pathname.includes(`/lesson/${lesson.id}`);
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

      <div className="px-4 pt-4 border-t border-[#30363d] mt-6">
         <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 italic">Certificación Final</h2>
         <Link 
            href={`/dashboard/instructor/courses/${courseId}/builder/quiz`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                pathname.includes('/builder/quiz')
                ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
            }`}
         >
            <span className="text-sm shrink-0">📝</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Examen del Curso</span>
         </Link>
      </div>
    </div>
  );
}
