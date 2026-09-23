'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('plattform_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('plattform_cookie_consent', 'all');
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('plattform_cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0d1524] border-t-2 border-cyan-500 shadow-2xl z-[9999] p-6 animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-sm text-gray-300 leading-relaxed">
          <h3 className="font-bold text-white mb-1">Tu privacidad es importante</h3>
          Utilizamos cookies para mejorar tu experiencia en Plattform, analizar el tráfico del sitio y personalizar el contenido. 
          Al hacer clic en "Aceptar todas", aceptas el uso de cookies en tu dispositivo. Puedes leer más en nuestra{' '}
          <Link href="/cookies" className="text-cyan-400 hover:underline font-bold">Política de Cookies</Link>.
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={acceptEssential}
            className="px-6 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Solo esenciales
          </button>
          <button 
            onClick={acceptAll}
            className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
