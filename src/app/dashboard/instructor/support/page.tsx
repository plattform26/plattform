'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const supportEmail = "soporte@plattform.mx";
  const whatsappNumber = "+525623194635";
  const whatsappLink = "https://wa.me/525623194635";

  return (
    <div className="animate-fade-in font-poppins space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-space-grotesk font-black text-white italic">Centro de <span className="text-cyan-400">Soporte</span></h1>
           <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold text-[10px] italic">Estamos aquí para potenciar tu experiencia en la plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EMAIL SUPPORT */}
        <div className="group relative bg-[#0d1524] border border-blue-500/10 rounded-[40px] p-10 overflow-hidden hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
               ✉️
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Atención vía Email</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Para consultas técnicas detalladas, facturación o reportes de errores, nuestro equipo de ingeniería está listo para ayudarte.
            </p>
            <div className="pt-4">
              <a 
                href={`mailto:${supportEmail}`}
                className="inline-block px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gray-200 transition-all shadow-lg shadow-white/5"
              >
                Enviar correo →
              </a>
              <p className="mt-4 text-[11px] font-mono text-blue-400/60 uppercase font-black">{supportEmail}</p>
            </div>
          </div>
        </div>

        {/* WHATSAPP SUPPORT */}
        <div className="group relative bg-[#0d1524] border border-cyan-500/10 rounded-[40px] p-10 overflow-hidden hover:border-cyan-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
               💬
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Soporte Estratégico</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              ¿Necesitas ayuda rápida o asesoría sobre cómo escalar tu academia? Chatea directamente con nuestro equipo de atención personalizada.
            </p>
            <div className="pt-4">
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-[#25D366] text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#25D366]/20"
              >
                Chat WhatsApp →
              </a>
              <p className="mt-4 text-[11px] font-mono text-cyan-400/60 uppercase font-black">{whatsappNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ PREVIEW */}
      <div className="bg-[#0d1524]/50 border border-white/5 rounded-[40px] p-12 text-center">
         <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Plattform Success</h4>
         <p className="text-white text-lg font-medium italic opacity-80">"Nuestra misión es que tu conocimiento no tenga límites técnicos. Si tú enseñas, nosotros resolvemos."</p>
      </div>
    </div>
  );
}
