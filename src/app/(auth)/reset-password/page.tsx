'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseÃ±as no coinciden.');
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
        throw new Error(data.error || 'OcurriÃ³ un error al actualizar.');
      }

      setStatus('success');
      setMessage('Tu contraseÃ±a ha sido actualizada exitosamente.');
      
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-md shadow-md text-center max-w-sm">
          Falta el token de seguridad mÃ¡gico en el enlace. Intenta desde el email nuevamente.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Elegir Nueva ContraseÃ±a</h2>
        
        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">{message}</div>
            <p className="text-sm text-gray-600 mb-4">Redirigiendo al inicio de sesiÃ³n...</p>
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Ir ahora
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">{message}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva ContraseÃ±a</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar ContraseÃ±a</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {status === 'loading' ? 'Actualizando...' : 'Actualizar ContraseÃ±a'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


