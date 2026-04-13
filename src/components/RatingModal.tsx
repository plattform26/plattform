'use client';
import { useState } from 'react';
import StarRating from './StarRating';

interface RatingModalProps {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (rating: number) => void;
}

export default function RatingModal({ 
  courseId, 
  courseTitle, 
  instructorName, 
  isOpen, 
  onClose,
  onSuccess 
}: RatingModalProps) {
  const [value, setValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (ratingValue: number) => {
    setValue(ratingValue);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingValue }),
      });

      if (res.ok) {
        setSuccess(true);
        onSuccess?.(ratingValue);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar calificación');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#152035] border border-blue-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t-gold/50 border-t-2 relative overflow-hidden group">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 blur-[100px] rounded-full pointer-events-none" />

        {success ? (
          <div className="text-center py-10 animate-in zoom-in duration-500">
            <span className="text-6xl mb-4 block">✨</span>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">¡Gracias por calificar!</h2>
            <p className="text-gray-400 text-sm">Tu opinión ayuda a mejorar la academia.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">
                ¿Cómo evalúas el curso?
              </h2>
              <div className="text-cyan-400 font-bold text-sm mb-1">{courseTitle}</div>
              <div className="text-gray-400 text-[10px] uppercase tracking-widest font-black">por {instructorName}</div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <StarRating 
                value={value} 
                onChange={handleSubmit} 
                size="xl" 
                readonly={submitting}
              />
              
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                Haz clic en una estrella para calificar
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </>
        )}
      </div>
      
      <style jsx>{`
        .bg-gold\/10 { background-color: rgba(255, 215, 0, 0.1); }
        .border-t-gold\/50 { border-top-color: rgba(255, 215, 0, 0.5); }
      `}</style>
    </div>
  );
}
