'use client';

import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface CertificateDownloaderProps {
  studentName: string;
  courseTitle: string;
  certificateCode: string; // Este es el ID único (ej. UUID o PLT-XXXX)
  finalScore?: number;
  buttonText?: string;
  variant?: 'primary' | 'outline';
}

export default function CertificateDownloader({
  studentName,
  courseTitle,
  certificateCode,
  buttonText = 'Descargar Certificado (PDF)',
  variant = 'primary'
}: CertificateDownloaderProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Generar QR que apunta a la nueva ruta de validación
        // Generar QR que apunta a la ruta de validación del entorno
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
        const url = `${baseUrl}/verify/${certificateCode}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 150,
          margin: 2,
          color: {
            dark: '#00e5ff',  // Cian Neón
            light: '#070d1a' // Dark Premium Background
          }
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQR();
  }, [certificateCode]);

  const downloadPDF = async () => {
    if (!certRef.current) return;
    
    const el = certRef.current;
    const originalDisplay = el.style.display;
    
    // Preparar para captura (Invisibilidad táctica)
    el.style.display = 'block';
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    
    try {
      const canvas = await html2canvas(el, { 
        scale: 3, // Mayor calidad para PDF
        useCORS: true,
        backgroundColor: '#070d1a' 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificado_Plattform_${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF. Asegúrate de que el QR se haya cargado.');
    } finally {
      el.style.display = originalDisplay;
      el.style.position = '';
      el.style.left = '';
    }
  };

  return (
    <>
      <button
        onClick={downloadPDF}
        className={variant === 'primary' 
          ? "px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-3"
          : "px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest"
        }
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        {buttonText}
      </button>

      {/* TEMPLATE MAESTRO (HIDDEN) — "DARK PREMIUM" REDESIGN */}
      <div 
        ref={certRef}
        style={{ 
          display: 'none', 
          width: '1123px',   // A4 Landscape Ratio
          height: '794px',  // A4 Landscape Ratio
          backgroundColor: '#070d1a',
          color: 'white',
          fontFamily: 'system-ui, sans-serif'
        }}
        className="relative overflow-hidden p-0 border-[20px] border-[#070d1a]"
      >
        {/* Border Neon Frame */}
        <div className="absolute inset-0 border-2 border-[#00e5ff]/30 m-4 rounded-[2rem]"></div>
        <div className="absolute inset-0 border-[1px] border-[#00e5ff]/10 m-8 rounded-[1.5rem]"></div>

        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full"></div>

        <div className="relative z-10 h-full flex flex-col items-center justify-between py-20 px-24 text-center">
            {/* Header */}
            <div>
                <p className="font-black tracking-[0.6em] uppercase text-[14px] text-cyan-400 mb-2 italic">Official Certification</p>
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto"></div>
            </div>

            {/* Main Body */}
            <div className="w-full">
                <h2 className="text-5xl font-black uppercase mb-12 tracking-tighter italic scale-y-110 text-white flex items-center justify-center gap-6">
                    <span className="h-px w-16 bg-white/20"></span>
                    CERTIFICADO DE APROBACIÓN
                    <span className="h-px w-16 bg-white/20"></span>
                </h2>
                
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-6">Plattform Academy otorga el presente reconocimiento a:</p>
                
                <h1 className="text-7xl font-black uppercase mb-12 italic tracking-tighter text-white px-10">
                  {studentName}
                </h1>

                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Por haber completado con éxito el programa de:</p>
                <h3 className="text-4xl font-black mb-8 uppercase tracking-tight text-[#00e5ff] italic">{courseTitle}</h3>
            </div>
            
            {/* Footer / Validation Area */}
            <div className="w-full flex justify-between items-end pt-12 border-t border-white/5">
                <div className="text-left flex flex-col">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-0.5">ID de Autoridad</p>
                    <p className="text-lg font-mono font-black text-cyan-400 uppercase leading-none">{certificateCode}</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase mt-2">Sello Digital: Plattform</p>
                </div>

                    <div className="flex flex-col items-center gap-2">
                        {qrDataUrl && (
                          <div className="p-1.5 bg-cyan-400/10 rounded-xl border border-cyan-400/20">
                            <img src={qrDataUrl} className="w-24 h-24" alt="QR Validation" />
                          </div>
                        )}
                    </div>

                <div className="text-right flex flex-col items-end">
                    <div className="w-40 h-px bg-white/20 mb-4"></div>
                    <p className="text-sm text-white font-black uppercase tracking-[0.4em] italic leading-none">PLATTFORM 2026</p>
                </div>
            </div>
        </div>

        {/* Watermarks */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 opacity-[0.03] pointer-events-none">
            <span className="text-[120px] font-black whitespace-nowrap tracking-widest text-white uppercase">VERIFIED CERTIFICATION — PLATTFORM</span>
        </div>
      </div>
    </>
  );
}
