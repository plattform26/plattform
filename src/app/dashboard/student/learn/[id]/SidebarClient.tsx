'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CourseProgressProvider, useCourseProgress } from '@/context/CourseProgressContext';

export default function SidebarClient(props: { 
  course: any; 
  completedLessonIds: string[]; 
  progressPercent: number;
  courseId: string;
  userRole: string;
  children: React.ReactNode; 
}) {
  return (
    <CourseProgressProvider initialCompletedLessonIds={props.completedLessonIds}>
      <SidebarInternal {...props} />
    </CourseProgressProvider>
  );
}

function SidebarInternal({ 
  course, 
  courseId,
  userRole,
  children 
}: { 
  course: any; 
  courseId: string;
  userRole: string;
  children: React.ReactNode; 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { completedLessonIds } = useCourseProgress();

  // Calcular progreso en tiempo real
  const progressPercent = useMemo(() => {
    const totalLessons = course.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
    return totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;
  }, [course.modules, completedLessonIds]);

  // Determinar la ruta de retorno según el rol
  const getReturnPath = () => {
    if (userRole === 'INSTRUCTOR') return '/dashboard/instructor/courses';
    if (userRole === 'ADMIN') return '/dashboard/admin/courses';
    return '/dashboard/student/courses';
  };

  return (
    <>
      {/* SIDEBAR */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-[258px]' : 'w-0'
        } h-full bg-[#050b16] border-r border-blue-500/10 flex flex-col transition-all duration-300 overflow-hidden relative z-50`}
      >
        <div className="p-6 border-b border-blue-500/10 flex flex-col gap-4">
           <Link href={getReturnPath()} className="text-[10px] uppercase font-bold text-gray-500 hover:text-cyan-400 transition-colors">
              ← Volver {userRole === 'STUDENT' ? 'a mis cursos' : 'al panel'}
           </Link>

           <div>
             <h2 className="text-sm font-bold leading-tight line-clamp-2">{course.title}</h2>
           </div>
           
           <div className="space-y-1.5 mt-2">
             <div className="flex justify-between text-[10px] font-bold">
               <span className="text-gray-500 uppercase">Mi Progreso</span>
               <span className="text-cyan-400">{progressPercent}%</span>
             </div>
             <div className="h-1 w-full bg-[#0d1524] rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500 transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
             </div>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
           {course.modules.map((mod: any) => (
             <div key={mod.id} className="space-y-1">
                <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-600 tracking-widest">
                   {mod.title}
                </div>
                <div className="space-y-0.5">
                   {mod.lessons.map((lesson: any) => {
                     const isActive = pathname.includes(lesson.id);
                     const isCompleted = completedLessonIds.includes(lesson.id);
                     
                     return (
                       <Link 
                         key={lesson.id} 
                         href={`/dashboard/student/learn/${courseId}/lesson/${lesson.id}`}
                         className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all ${
                           isActive 
                            ? 'bg-blue-600/10 text-cyan-400 border border-blue-500/10' 
                            : 'text-gray-400 hover:bg-blue-500/5 hover:text-white'
                         } ${isCompleted ? 'border-l-2 border-l-green-500' : ''}`}
                       >
                         <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] border ${
                           isCompleted 
                            ? 'bg-green-500/20 border-green-500 text-green-400' 
                            : isActive ? 'border-cyan-500 text-cyan-400' : 'border-gray-700 text-gray-600'
                         }`}>
                           {isCompleted ? '✓' : isActive ? '▶' : '○'}
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
         {/* TOPBAR */}
         <header className="h-16 flex items-center justify-between px-6 border-b border-blue-500/10 bg-[#080e1c]/80 backdrop-blur-md sticky top-0 z-40">
            <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-400 transition-colors"
            >
               {isSidebarOpen ? '❮ Ocultar' : '❯ Mostrar Temario'}
            </button>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block">
               Plattform Learning Engine <span className="text-cyan-400">v1.2</span>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
         </div>
      </main>
    </>
  );
}
