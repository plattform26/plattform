'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RatingModal from '@/components/RatingModal';
import StarRating from '@/components/StarRating';

export default function CertificatePage() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    // 1. Fetch Course Data
    fetch(`/api/courses/${courseId}`).then(res => res.json()).then(data => {
        setCourse(data);
        setLoading(false);
    });

    fetch(`/api/courses/${courseId}/rate`)
      .then(res => res.json())
      .then(data => {
        if (data.myRating) {
          setHasRated(true);
          setUserRating(data.myRating.rating);
        }
      });
  }, [courseId]);

  const handlePrint = () => {
    if (!hasRated) {
      setShowRatingModal(true);
    } else {
      window.print();
    }
  };

  if (loading) return <div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-gray-500 font-mono text-xs uppercase animate-pulse">Generando Documento...</div>;

  return (
    <div className="min-h-screen bg-[#070d1a] py-20 px-6 flex flex-col items-center">
        {/* MODAL DE CALIFICACIÓN AUTOMÁTICO/MANUAL */}
        <RatingModal 
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          courseId={courseId as string}
          courseTitle={course?.title || 'Curso'}
          instructorName={course?.instructor?.name || 'tu instructor'}
        />

        <div className="max-w-4xl w-full bg-white text-black p-2 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-sm">
            {/* Marco Minimalista */}
            <div className="border border-black/5 p-20 h-full flex flex-col items-center text-center relative z-10">
                {/* Logo o Marca */}
                <div className="mb-12">
                    <span className="text-[12px] font-black uppercase tracking-[0.6em] border-b-2 border-black pb-2">PLATTFORM</span>
                </div>

                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 italic">Certificado de Excelencia</h3>
                
                <p className="text-xl font-light text-gray-600 mb-2 italic">Esto certifica que</p>
                <h1 className="text-6xl font-space-grotesk font-black text-black mb-12 tracking-tighter uppercase">Alumno Graduado</h1>
                
                <p className="text-xl font-light text-gray-600 mb-2 italic">ha completado satisfactoriamente el curso</p>
                <h2 className="text-4xl font-space-grotesk font-black text-blue-600 mb-16 underline decoration-black/10 underline-offset-8 decoration-4">{course?.title}</h2>

                <div className="w-full h-[1px] bg-black/10 mb-16" />

                <div className="grid grid-cols-2 w-full gap-20">
                    <div className="text-left border-l border-black pl-6">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">Fecha de Emisión</span>
                        <span className="text-sm font-black uppercase">{new Date().toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="text-right border-r border-black pr-6">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">ID de Verificación</span>
                        <span className="text-sm font-mono font-bold uppercase">PL-{courseId?.toString().substring(0, 8)}-{Math.floor(Math.random()*10000)}</span>
                    </div>
                </div>

                <div className="mt-20">
                    <div className="w-32 h-32 border-2 border-black/5 rounded-full flex items-center justify-center opacity-10">
                         <span className="text-4xl">🎓</span>
                    </div>
                </div>
            </div>

            {/* Elementos de Diseño Premium (Acentos) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rotate-45 translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-600/5 rotate-45 -translate-x-16 translate-y-16" />
        </div>

        <div className="mt-12 flex flex-col items-center gap-8 no-print pb-20">
            {/* ESTADO DE CALIFICACIÓN EN CERTIFICADO */}
            <div className="bg-[#152035]/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-3">
              {hasRated ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Valoración emitida</span>
                  <div className="flex items-center gap-4">
                     <span className="text-white font-bold text-sm italic">Tu calificación:</span>
                     <StarRating value={userRating || 0} readonly size="md" />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowRatingModal(true)}
                  className="flex items-center gap-2 text-gold hover:text-cyan-400 transition-all font-black uppercase text-[10px] tracking-widest group"
                >
                  <span className="text-lg group-hover:scale-125 transition-transform">⭐</span> Califícalo aquí
                </button>
              )}
            </div>

            <div className="flex gap-6">
                <button 
                    onClick={handlePrint}
                    className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5"
                >
                    🖨️ Imprimir o Guardar PDF
                </button>
                <Link 
                    href="/dashboard/student"
                    className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Volver al Dashboard
                </Link>
            </div>
            
            <button 
                onClick={() => setShowRatingModal(true)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
                ⭐ ¿Te gustó el curso? Califícalo aquí
            </button>
        </div>

        <style jsx global>{`
            @media print {
                .no-print { display: none; }
                body { background: white; }
                .min-h-screen { padding: 0; }
            }
        `}</style>
    </div>
  );
}
