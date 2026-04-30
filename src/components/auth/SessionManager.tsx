'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AlertTriangle, Clock, ShieldCheck, LogOut } from 'lucide-react';

const SESSION_TIMEOUT = 15 * 60; // 15 minutos en segundos
const WARNING_THRESHOLD = 2 * 60; // 2 minutos antes del cierre
const REFRESH_INTERVAL = 10 * 60; // 10 minutos para refresh automático

export default function SessionManager() {
  const [timeLeft, setTimeLeft] = useState(SESSION_TIMEOUT);
  const [showWarning, setShowWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);
  const failedAttemptsRef = useRef<number>(0);
  const router = useRouter();

  // Función para renovar el token en el servidor
  const refreshSession = useCallback(async () => {
    if (isRefreshingRef.current || failedAttemptsRef.current >= 3) return false;
    
    isRefreshingRef.current = true;
    // Actualizamos el ref inmediatamente para evitar reintentos por actividad mientras la petición está en vuelo
    lastRefreshRef.current = Date.now();

    try {
      // Usamos el endpoint de sesión de NextAuth para disparar un refresh del token
      const res = await fetch('/api/auth/session?update', { method: 'GET' });
      if (res.ok) {
        failedAttemptsRef.current = 0;
        console.log('Session Heartbeat: Sincronización exitosa.');
        return true;
      } else {
        // Si hay un 401 o similar, incrementamos fallos para dejar de intentar pronto
        failedAttemptsRef.current += 1;
        console.warn(`Session Heartbeat: Fallo en renovación (${res.status}).`);
        return false;
      }
    } catch (error) {
      failedAttemptsRef.current += 1;
      console.error('Error refreshing session:', error);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = useCallback(async () => {
    try {
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch (error) {
      console.error('Error logging out:', error);
      window.location.href = '/login';
    }
  }, []);

  // Reset del timer por actividad
  const resetTimer = useCallback(() => {
    if (isExpired || failedAttemptsRef.current >= 3) return;

    setTimeLeft(SESSION_TIMEOUT);
    setShowWarning(false);

    // Si han pasado más de X minutos desde el último refresh, lo hacemos ahora
    if (Date.now() - lastRefreshRef.current > REFRESH_INTERVAL * 1000) {
      refreshSession();
    }
  }, [isExpired, refreshSession]);

  // Listeners de actividad
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    const handler = () => {
      // Usamos un pequeño throttle para no saturar el estado
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handler));
    
    // Timer principal
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleLogout();
          return 0;
        }
        
        // Mostrar advertencia a los 2 minutos (120s)
        if (prev <= WARNING_THRESHOLD + 1 && !showWarning) {
          setShowWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handler));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer, handleLogout, showWarning]);

  // Formatear tiempo mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070d1a]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d1524] border border-red-500/30 w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="text-red-500" size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sesión por Expirar</h2>
            <p className="text-gray-400 text-sm leading-relaxed px-4">
              Por seguridad, tu sesión se cerrará en <span className="text-red-500 font-bold">{formatTime(timeLeft)}</span> debido a la inactividad detectada.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-4">
            <button 
              onClick={resetTimer}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} />
              Mantener sesión activa
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-4 border border-white/10 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Cerrar sesión ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
