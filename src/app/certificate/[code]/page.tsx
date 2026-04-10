import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function CertificatePrintPage({ params }: { params: { code: string } }) {
  const certificate = await prisma.certification.findUnique({
    where: { certificateCode: params.code },
    include: {
      user: { select: { name: true, lastName: true } },
      course: {
        include: {
          instructor: { 
              select: { name: true, lastName: true },
          },
        }
      }
    }
  });

  if (!certificate) return notFound();

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center font-serif text-gray-900 border-t-8 border-cyan-500">
      <div className="max-w-[1000px] w-full bg-white shadow-2xl p-16 relative overflow-hidden print:shadow-none print:p-10">
        
        {/* Marca de Agua (decoración) */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 text-center space-y-12">
          {/* HEADER */}
          <div className="space-y-4">
             <div className="flex justify-center mb-6">
                <div className="text-6xl text-cyan-500 group-hover:scale-110 transition-transform">🏆</div>
             </div>
             <div className="text-4xl font-space-grotesk font-black tracking-widest text-[#0a1f44] uppercase">
                PLATTFORM
             </div>
             <div className="h-0.5 w-64 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
             <h2 className="text-2xl font-bold italic text-gray-500">Certificado de Terminación</h2>
          </div>

          {/* CUERPO */}
          <div className="space-y-8">
             <p className="text-xl uppercase tracking-widest text-gray-400 font-bold">Otorgado a</p>
             <h1 className="text-6xl font-black text-[#0a1f44] border-b-2 border-[#0a1f44]/10 pb-6 mb-8 uppercase">
                {certificate.user.name} {certificate.user.lastName}
             </h1>
             <p className="text-xl leading-relaxed text-gray-600 max-w-2xl mx-auto italic">
                Por haber completado satisfactoriamente y con éxito el programa de capacitación avanzada en:
             </p>
             <div className="bg-[#0a1f44]/5 p-10 rounded-3xl border border-[#0a1f44]/10">
                <h3 className="text-4xl font-black text-[#0a1f44] mb-4">{certificate.course.title}</h3>
                <div className="flex flex-wrap justify-center gap-8 text-sm uppercase tracking-widest font-bold text-gray-500">
                   <span>Instructor: {certificate.course.instructor.name} {certificate.course.instructor.lastName}</span>
                   <span>•</span>
                   <span>Duración: {Number(certificate.course.durationHours) || 0} horas estimadas</span>
                </div>
             </div>
          </div>

          {/* FIRMAS Y PIE */}
          <div className="grid grid-cols-2 gap-20 pt-16">
             <div className="space-y-4">
                <div className="h-px bg-gray-300 w-full mb-6"></div>
                <div className="text-2xl font-handwriting italic text-gray-500 transform -rotate-2">
                   {certificate.course.instructor.name} {certificate.course.instructor.lastName}
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Instructor del Curso</p>
             </div>
             <div className="space-y-4 text-[#0a1f44]/80">
                <div className="h-px bg-gray-300 w-full mb-6"></div>
                <div className="text-2xl font-bold uppercase tracking-widest">
                   PLATTFORM <span className="text-cyan-500">ENG.</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Dirección Académica</p>
             </div>
          </div>

          <div className="pt-20 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-t border-gray-100 flex justify-between items-center">
             <span>Emitido el: {new Date(certificate.issuedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
             <span className="text-cyan-600">Código de Verificación: {certificate.certificateCode}</span>
          </div>

          <div className="print:hidden pt-10">
             <button 
                onClick={() => window.print()}
                className="px-10 py-4 bg-cyan-600 text-white font-bold rounded-2xl shadow-xl hover:bg-cyan-500 transition-all hover:scale-105"
             >
                Imprimir Certificado / Guardar como PDF
             </button>
          </div>
        </div>
      </div>
      
      {/* Estilos específicos para fuentes (puedes agregarlos a tu global.css si prefieres) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-space-grotesk { font-family: 'Space Grotesk', sans-serif; }
        @media print {
            body { background: white; padding: 0; }
            .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
