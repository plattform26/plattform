'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }


      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center justify-center bg-[#070d1a] text-white">
      {/* LOGO / HEADER */}
      <div className="mb-10 animate-fade-in">
        <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-3xl tracking-tighter">
           <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 bg-clip-text text-transparent">PLATTFORM</span>
        </Link>
      </div>

      <div className="max-w-md w-full p-10 bg-[#0d1524] border border-blue-500/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <Link href="/register" className="text-xs font-bold text-cyan-400 hover:text-white mb-6 inline-flex items-center gap-2 transition-colors uppercase tracking-widest">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver
        </Link>
        
        <div className="mb-8">
          <h2 className="text-2xl font-space-grotesk font-bold text-white mb-2">Registro de Alumno</h2>
          <p className="text-gray-400 text-sm font-light leading-relaxed">Únete e inicia tu viaje de aprendizaje hoy mismo.</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-xs font-semibold animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Nombre</label>
              <input 
                type="text" 
                required 
                placeholder="Juan"
                className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Apellidos</label>
              <input 
                type="text" 
                required 
                placeholder="Pérez"
                className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600" 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              placeholder="tu@email.com"
              className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                minLength={6} 
                placeholder="••••••••"
                className="block w-full px-4 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Procesando...' : 'Crear cuenta de alumno'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-bold text-cyan-400 hover:text-white transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

