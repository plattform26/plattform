'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCourseProgress } from '@/context/CourseProgressContext';

export default function LessonClient({
  courseId,
  lessonId,
  prevLesson,
  nextLesson,
  userRole,
  canAccessQuiz
}: {
  courseId: string;
  lessonId: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  userRole: string;
  canAccessQuiz: boolean;
}) {
  const { isLessonCompleted, toggleLesson } = useCourseProgress();
  const completed = isLessonCompleted(lessonId);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleComplete = async () => {
    setLoading(true);
    const newStatus = !completed;

    // Optimistic Update: Activamos visualmente de inmediato
    toggleLesson(lessonId, newStatus);

    try {
      const res = await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, completed: newStatus }),
      });
      
      if (res.ok) {
        router.refresh();
        // Si marcamos como completada y hay siguiente, avanzar automáticamente
        if (newStatus && nextLesson) {
           router.push(`/dashboard/student/learn/${courseId}/lesson/${nextLesson.id}`);
        }
      } else {
        // Revertir en caso de error
        toggleLesson(lessonId, completed);
      }
    } catch (err) {
      console.error(err);
      // Revertir en caso de error
      toggleLesson(lessonId, completed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a1f44]/40 backdrop-blur-md border border-blue-500/10 rounded-3xl p-8 transition-all">
       <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="w-1/3">
             {prevLesson && (
               <Link 
                  href={`/dashboard/student/learn/${courseId}/lesson/${prevLesson.id}`}
                  className="group flex flex-col items-start gap-1"
               >
                  <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-cyan-400 transition-colors">← Anterior</span>
                  <span className="text-[11px] font-medium text-gray-400 group-hover:text-white line-clamp-1 truncate transition-colors">{prevLesson.title}</span>
               </Link>
             )}
          </div>

          <button 
             onClick={handleToggleComplete}
             disabled={loading}
             className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
               completed 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_4px_15px_rgba(34,197,94,0.15)]' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl hover:scale-105 active:scale-95'
             }`}
          >
             {loading ? '...' : (completed ? '✓ Completada' : 'Marcar como completada')}
          </button>

          <div className="w-1/3 flex justify-end">
             {nextLesson ? (
                <Link 
                   href={`/dashboard/student/learn/${courseId}/lesson/${nextLesson.id}`}
                   className="group flex flex-col items-end gap-1 text-right"
                >
                   <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-cyan-400 transition-colors">Siguiente →</span>
                   <span className="text-[11px] font-medium text-gray-400 group-hover:text-white line-clamp-1 truncate transition-colors">{nextLesson.title}</span>
                </Link>
             ) : (
                <Link 
                   href={`/dashboard/student/learn/${courseId}/quiz`}
                   className={`flex flex-col items-end gap-1 text-right transition-all transform hover:scale-105 ${canAccessQuiz ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}
                >
                   <span className="text-[10px] uppercase font-black text-amber-500 animate-pulse">Final del Camino</span>
                   <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black text-[10px] font-black rounded-lg uppercase tracking-wider shadow-[0_0_20_rgba(245,158,11,0.3)]">
                      🏆 REALIZAR EVALUACIÓN FINAL
                   </span>
                </Link>
             )}
          </div>
       </div>
    </div>
  );
}
