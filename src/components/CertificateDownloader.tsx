'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateDownloaderProps {
  studentName: string;
  courseTitle: string;
  certificateCode: string;
  finalScore?: number;
  buttonText?: string;
  variant?: 'primary' | 'outline';
}

export default function CertificateDownloader({
  studentName,
  courseTitle,
  certificateCode,
  finalScore,
  buttonText = 'Descargar Certificado (PDF)',
  variant = 'primary'
}: CertificateDownloaderProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!certRef.current) return;
    
    // Temporalmente hacer visible para captura
    const el = certRef.current;
    el.style.display = 'block';
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificado-${courseTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      // Volver a ocultar
      el.style.display = 'none';
    }
  };

  return (
    <>
      <button
        onClick={downloadPDF}
        className={variant === 'primary' 
          ? "px-8 py-4 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
          : "px-4 py-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-cyan-400 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest"
        }
      >
        {buttonText}
      </button>

      {/* Template oculto para el Certificado */}
      <div 
        ref={certRef}
        style={{ display: 'none', width: '1000px', backgroundColor: 'white' }}
        className="p-16 border-[12px] border-double border-[#00f2ff] text-black text-center"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-[8px] rotate-45 translate-x-4 text-black">VERIFICADO PLATTFORM — AUTÉNTICO</div>
        <p className="font-black tracking-[0.4em] uppercase text-xs mb-6 text-[#00f2ff]">PLATTFORM ACADEMY</p>
        <h2 className="text-5xl font-black uppercase mb-8 tracking-tighter italic scale-y-110 text-black">CERTIFICADO DE APROBACIÓN</h2>
        <p className="text-gray-500 mb-2 font-bold uppercase tracking-widest text-[10px]">Se otorga el presente a:</p>
        <h1 className="text-6xl font-black uppercase mb-10 italic border-b-4 border-black/5 inline-block px-12 text-black">{studentName}</h1>
        <p className="text-gray-500 mb-2 font-bold uppercase tracking-widest text-[10px]">Por haber completado satisfactoriamente el curso de</p>
        <h3 className="text-3xl font-black mb-12 uppercase tracking-tight text-black">{courseTitle}</h3>
        
        <div className="flex justify-between items-end px-10">
            <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID de Certificación</p>
                <p className="text-xl font-mono font-black text-[#00f2ff]">{certificateCode}</p>
            </div>
            {finalScore !== undefined && (
              <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Calificación Final</p>
                  <p className="text-4xl font-black text-black">{finalScore.toFixed(1)}/10.0</p>
              </div>
            )}
            <div className="text-right">
                <p className="text-[9px] text-gray-400 font-bold max-w-[150px] uppercase leading-tight italic">Emitido bajo estricta validación de persistencia Plattform 2026</p>
            </div>
        </div>
      </div>
    </>
  );
}
