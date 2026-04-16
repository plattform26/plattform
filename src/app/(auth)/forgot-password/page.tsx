'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error. Intenta nuevamente.');
      }

      setStatus('success');
      setMessage(data.message || 'Si tu correo existe en nuestros registros, pronto recibirás un enlace de recuperación.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070d1a] px-6">
      <div className="mb-10 animate-fade-in text-center">
        <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-3xl tracking-tighter">
           <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 bg-clip-text text-transparent italic">PLATTFORM</span>
        </Link>
      </div>

      <div className="max-w-md w-full p-10 bg-[#0d1524] border border-blue-500/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-space-grotesk font-bold text-white mb-2">Recuperar Acceso</h2>
          <p className="text-gray-400 text-sm">Ingresa tu correo y te enviaremos instrucciones para restablecer tu clave.</p>
        </div>
        
        {status === 'success' ? (
          <div className="text-center animate-fade-in">
            <div className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 p-4 rounded-2xl mb-6 text-sm font-semibold">
              ✨ {message}
            </div>
            <Link href="/login" className="inline-block w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-lg transition-all text-center">
              Volver al Inicio de Sesión
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
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-4 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando enlace...' : 'Enviar enlace de recuperación →'}
            </button>
            
            <div className="text-center mt-6 pt-6 border-t border-blue-500/10">
              <Link href="/login" className="text-xs font-bold text-cyan-400 hover:text-white transition-colors">
                Llevarme de vuelta al Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
