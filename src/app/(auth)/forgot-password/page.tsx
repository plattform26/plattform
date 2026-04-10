'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recuperar Contraseña</h2>
        
        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">{message}</div>
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-600 text-center mb-6">
              Ingresa tu correo y te enviaremos instrucciones.
            </p>
            
            {status === 'error' && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">{message}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar enlace'}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                Llevarme de vuelta al Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
