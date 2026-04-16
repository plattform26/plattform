'use client';
export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al actualizar.');
      }

      setStatus('success');
      setMessage('Tu contraseña ha sido actualizada exitosamente.');
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070d1a] p-4 text-center">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-8 rounded-3xl shadow-lg max-w-sm">
          <p className="font-bold mb-4">⚠️ Enlace Inválido</p>
          <p className="text-sm opacity-80">Falta el token de seguridad en el enlace. Por favor, solicita uno nuevo desde la página de recuperación.</p>
          <Link href="/forgot-password" title="Solicitar nuevo enlace" className="mt-6 inline-block font-bold text-cyan-400 hover:text-white transition-colors">Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070d1a] px-6">
      <div className="mb-10 animate-fade-in text-center">
        <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-3xl tracking-tighter">
           <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 bg-clip-text text-transparent italic">PLATTFORM</span>
        </Link>
      </div>

      <div className="max-w-md w-full p-10 bg-[#0d1524] border border-blue-500/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-space-grotesk font-bold text-white mb-2">Nueva Contraseña</h2>
          <p className="text-gray-400 text-sm">Define tu nueva clave de acceso para recuperar el control de tu cuenta.</p>
        </div>
        
        {status === 'success' ? (
          <div className="text-center animate-fade-in">
            <div className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 p-4 rounded-2xl mb-6 text-sm font-semibold">
              ✨ {message}
            </div>
            <p className="text-gray-500 text-xs mb-4 italic">Redirigiendo al portal de acceso...</p>
            <Link href="/login" className="inline-block w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-lg transition-all text-center">
              Ir al Login Ahora
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-xs font-semibold animate-shake">
                ⚠️ {message}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Nueva Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Confirmar Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-4 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Actualizando...' : 'Establecer nueva clave →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-white/50 font-bold text-[10px] tracking-[0.3em] uppercase">
        Validando Seguridad del Portal...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}