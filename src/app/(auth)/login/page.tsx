'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill email if provided in query (optional UX)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Redirección inmediata según rol
      const targetUrl = data.role === 'ADMIN' 
        ? '/dashboard/admin' 
        : data.role === 'INSTRUCTOR' 
          ? '/dashboard/instructor' 
          : '/dashboard/student';
      
      router.push(targetUrl);
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070d1a] px-6">
      <div className="mb-10 animate-fade-in">
        <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-3xl tracking-tighter">
           <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 bg-clip-text text-transparent">PLATTFORM</span>
        </Link>
      </div>

      <div className="max-w-md w-full p-10 bg-[#0d1524] border border-blue-500/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="mb-8">
          <h2 className="text-2xl font-space-grotesk font-bold text-white mb-2">Bienvenido de nuevo</h2>
          <p className="text-gray-400 text-sm">Ingresa tus credenciales para acceder a tu panel.</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-xs font-semibold animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
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

          <div className="space-y-2">
            <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-xs font-semibold text-blue-500 hover:text-cyan-400 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Iniciar Sesión →'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-blue-500/10 text-center">
          <p className="text-gray-500">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/register" className="font-bold text-cyan-400 hover:text-white transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-white font-black uppercase tracking-[0.3em] text-[10px]">Iniciando Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}