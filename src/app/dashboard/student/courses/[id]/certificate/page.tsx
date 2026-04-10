'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CertificatePage() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`).then(res => res.json()).then(data => {
        setCourse(data);
        setLoading(false);
    });
  }, [courseId]);

  if (loading) return <div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-gray-500 font-mono text-xs uppercase animate-pulse">Generando Documento...</div>;

  return (
    <div className="min-h-screen bg-[#070d1a] py-20 px-6 flex flex-col items-center">
        <div className="max-w-4xl w-full bg-white text-black p-2 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-sm">
            {/* Marco Minimalista */}
            <div className="border border-black/5 p-20 h-full flex flex-col items-center text-center relative z-10">
                {/* Logo o Marca */}
                <div className="mb-12">
                    <span className="text-[12px] font-black uppercase tracking-[0.6em] border-b-2 border-black pb-2">PLATTFORM</span>
                </div>

                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 italic">Certificado de Excelencia</h3>
                
                <p className="text-xl font-light text-gray-600 mb-2 italic">Esto certifica que</p>
                <h1 className="text-6xl font-space-grotesk font-black text-black mb-12 tracking-tighter">Alejandro Instructor</h1>
                
                <p className="text-xl font-light text-gray-600 mb-2 italic">ha completado satisfactoriamente el curso</p>
                <h2 className="text-4xl font-space-grotesk font-black text-blue-600 mb-16 underline decoration-black/10 underline-offset-8 decoration-4">{course?.title}</h2>

                <div className="w-full h-[1px] bg-black/10 mb-16" />

                <div className="grid grid-cols-2 w-full gap-20">
                    <div className="text-left border-l border-black pl-6">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">Fecha de Emisión</span>
                        <span className="text-sm font-black uppercase">Abril 1, 2026</span>
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

        <div className="mt-12 flex gap-6 no-print">
            <button 
                onClick={() => window.print()}
                className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
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
