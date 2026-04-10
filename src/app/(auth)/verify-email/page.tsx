'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se proporcionÃ³ un token vÃ¡lido.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Tu correo ha sido verificado con Ã©xito.');
        } else {
          setStatus('error');
          setMessage(data.error || 'El enlace es invÃ¡lido o ha expirado.');
        }
      } catch (e) {
        setStatus('error');
        setMessage('OcurriÃ³ un error en el servidor. Intenta nuevamente mÃ¡s tarde.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">VerificaciÃ³n de Email</h2>
        
        {status === 'loading' && (
          <div className="text-blue-600 animate-pulse font-medium">{message}</div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-green-600 font-medium mb-6">{message}</div>
            <Link href="/login" className="inline-block py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Ir a Iniciar SesiÃ³n
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-red-600 font-medium mb-6">{message}</div>
            <p className="text-sm text-gray-500 mb-4">Si tu token expirÃ³, por favor intenta iniciar sesiÃ³n para solicitar un nuevo enlace.</p>
            <Link href="/login" className="inline-block py-2 px-6 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
              Volver
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


