'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewVerificationPage() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const onSubmit = useCallback(async () => {
    if (success || error) return;

    if (!token) {
      setError('Token faltante en la URL.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Algo salió mal durante la verificación.');
      } else {
        // Misión: Sincronización Real-time tras éxito
        await fetch('/api/auth/sync', { method: 'POST' }).catch(() => null);

        setSuccess(data.message || '¡Email verificado correctamente!');
        
        // Redirigir automáticamente tras un breve delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [token, success, error, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="min-h-screen bg-[#080e1c] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#080e1c] to-[#080e1c]">
      <div className="w-full max-w-md bg-[#0b1120] border border-cyan-500/20 rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Decoración de fondo */}
        {loading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500/20">
             <div className="h-full bg-cyan-500 animate-[loading_2s_infinite]"></div>
          </div>
        )}

        <div className="mb-8">
          {loading && (
            <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
              <RefreshCcw className="w-10 h-10 text-cyan-500 animate-spin" />
            </div>
          )}
          
          {success && (
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          )}

          {error && (
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto animate-in zoom-in duration-500">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-space-grotesk font-black text-white mb-4 uppercase tracking-tighter italic">
          {loading ? 'Verificando...' : success ? '¡Éxito!' : 'Error'}
        </h1>

        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          {loading && 'Estamos validando tus credenciales de seguridad en la red de Plattform...'}
          {success && 'Tu identidad ha sido confirmada. Estamos preparándote para entrar al dashboard en un momento.'}
          {error && error}
        </p>

        {success && (
          <Link 
            href="/dashboard"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            Ir al Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        {(error || !loading) && !success && (
          <Link 
            href="/login"
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            Volver al Login
          </Link>
        )}

        <div className="mt-8 text-[9px] text-gray-600 uppercase tracking-widest font-bold">
           PLATTFORM SECURITY PROTOCOL v2.0
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { width: 0; left: 0; }
          50% { width: 100%; left: 0; }
          100% { width: 0; left: 100%; }
        }
      `}</style>
    </div>
  );
}
