'use client';

interface InstructorPreviewLessonNavigationProps {
  prevLesson?: { id: string; title: string } | null;
  nextLesson?: { id: string; title: string } | null;
  onPreviousClick: () => void;
  onNextClick: () => void;
}

export default function InstructorPreviewLessonNavigation({
  prevLesson,
  nextLesson,
  onPreviousClick,
  onNextClick
}: InstructorPreviewLessonNavigationProps) {
  return (
    <div className="bg-[#0a1f44]/40 backdrop-blur-md border border-blue-500/10 rounded-3xl p-8 transition-all mt-20">
       <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="w-1/3">
             {prevLesson && (
               <button 
                  onClick={onPreviousClick}
                  className="group flex flex-col items-start gap-1 text-left"
               >
                  <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-cyan-400 transition-colors">← Anterior</span>
                  <span className="text-[11px] font-medium text-gray-400 group-hover:text-white line-clamp-1 truncate transition-colors">{prevLesson.title}</span>
               </button>
             )}
          </div>

          <button 
             disabled={true}
             className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-cyan-500/30 text-cyan-400 border border-cyan-500/20 cursor-not-allowed opacity-60"
          >
             ✓ Marcar como completada (Preview)
          </button>

          <div className="w-1/3 flex justify-end">
             {nextLesson && (
                <button 
                   onClick={onNextClick}
                   className="group flex flex-col items-end gap-1 text-right"
                >
                   <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-cyan-400 transition-colors">Siguiente →</span>
                   <span className="text-[11px] font-medium text-gray-400 group-hover:text-white line-clamp-1 truncate transition-colors">{nextLesson.title}</span>
                </button>
             )}
          </div>
       </div>
    </div>
  );
}
