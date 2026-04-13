'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function VerifyEmailNotice() {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      // TODO: Implementar endpoint de re-envío si es necesario
      // Por ahora simulamos
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Se ha enviado un nuevo enlace de verificación a tu correo.');
    } catch (error) {
      toast.error('Error al re-enviar el correo. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080e1c] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#080e1c] to-[#080e1c]">
      <div className="w-full max-w-md bg-[#0b1120] border border-cyan-500/20 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-cyan-500/5">
        <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative group">
          <div className="absolute inset-0 bg-cyan-500/20 blur-2xl group-hover:bg-cyan-500/30 transition-all"></div>
          <Mail className="w-10 h-10 text-cyan-500 relative z-10" />
        </div>

        <h1 className="text-3xl font-space-grotesk font-black text-white mb-4 uppercase tracking-tighter italic">
          Verifica tu <span className="text-cyan-400">identidad</span>
        </h1>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Para proteger la integridad de nuestra comunidad, necesitamos que confirmes tu dirección de correo electrónico antes de acceder al dashboard.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleResend}
            disabled={loading}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900/50 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
          >
            {loading ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {loading ? 'Re-enviando...' : 'Re-enviar correo de verificación'}
          </button>

          <Link 
            href="/login" 
            className="w-full py-4 border border-secondary/10 hover:border-secondary/30 text-gray-500 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al Inicio Sesión
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">
            ¿No recibiste nada? Revisa tu carpeta de Spam.
          </p>
        </div>
      </div>
    </div>
  );
}
