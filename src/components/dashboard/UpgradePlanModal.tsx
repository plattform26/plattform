'use client';

import Link from 'next/link';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  featureName?: string;
}

export default function UpgradePlanModal({ 
  isOpen, 
  onClose, 
  title = "Potencia tu Academia", 
  description = "Has descubierto una función exclusiva diseñada para los líderes del mercado.",
  featureName = "Duplicación de Cursos"
}: UpgradePlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0b1221] border border-cyan-500/30 rounded-[2.5rem] max-w-lg w-full p-10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)] relative overflow-hidden group">
        
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/20 transition-all duration-700" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-xs"
        >
          ✕
        </button>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-8 shadow-inner">
            <span className="text-4xl">💎</span>
          </div>

          <div className="mb-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
              Scale Exclusive
            </span>
          </div>

          <h3 className="text-3xl font-space-grotesk font-black text-white mb-4 tracking-tight">
            {title}
          </h3>

          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[85%] mx-auto font-light">
            {description} desbloquea la <span className="text-cyan-400 font-bold">{featureName}</span> y lleva tu producción de contenido al siguiente nivel.
          </p>

          <div className="space-y-4">
            <Link 
              href="/dashboard/instructor/plan"
              onClick={onClose}
              className="group/btn relative w-full inline-flex items-center justify-center py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-sm font-black text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <span className="relative">Subir al Plan Scale 🚀</span>
            </Link>

            <button 
              onClick={onClose}
              className="w-full py-4 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              Quizás más tarde
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
             <div className="text-left">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Beneficio</div>
                <div className="text-xs text-gray-300">Duplicación modular ilimitada</div>
             </div>
             <div className="text-left">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Impacto</div>
                <div className="text-xs text-gray-300">Ahorra +15 hrs de trabajo</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
