'use client';
import StarRating from '../StarRating';

export default function ManualRatingButton({ 
  courseId, 
  userRating 
}: { 
  courseId: string; 
  userRating: number | null 
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-rating-modal', { 
      detail: { courseId } 
    }));
  };

  if (userRating) {
    return (
      <div className="mt-2 flex flex-col items-start gap-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Tu calificación:</span>
        <StarRating value={userRating} readonly size="sm" />
      </div>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className="mt-2 text-[9px] font-black uppercase tracking-widest text-gold hover:text-cyan-400 transition-colors flex items-center gap-1 group"
    >
      <span className="group-hover:animate-spin">⭐</span> Califícalo aquí
      <style jsx>{`
        .text-gold { color: #FFD700; }
      `}</style>
    </button>
  );
}
