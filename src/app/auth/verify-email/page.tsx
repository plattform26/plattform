'use client';

import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center justify-center bg-[#070d1a] text-white">
      {/* LOGO */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center gap-2 font-space-grotesk font-bold text-3xl tracking-tighter">
           <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 bg-clip-text text-transparent uppercase">PLATTFORM</span>
        </div>
      </div>

      <div className="max-w-md w-full p-10 bg-[#0d1524] border border-blue-500/20 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
        {/* DECORATIVE LIGHT */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-500/50 blur-sm"></div>
        
        <div className="mb-8">
           <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">
             📧
           </div>
           <h1 className="text-3xl font-space-grotesk font-black mb-4 italic uppercase tracking-tighter">¡Casi listo!</h1>
           <p className="text-gray-400 text-sm leading-relaxed font-light">
             Hemos enviado un enlace de activación a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.
           </p>
        </div>

        <div className="space-y-4">
           <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-normal">
                Nota: No podrás acceder a tu panel de control hasta que tu correo haya sido verificado satisfactoriamente.
              </p>
           </div>
           
           <Link 
            href="/login" 
            className="block w-full py-4 px-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
           >
            Volver al Inicio de Sesión
           </Link>
        </div>

        <p className="mt-10 text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em]">
          &copy; 2026 Plattform.mx · High Performance Education
        </p>
      </div>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
