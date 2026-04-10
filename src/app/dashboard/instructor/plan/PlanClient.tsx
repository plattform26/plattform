'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PlanClient({ plans, activePlanId }: { plans: any[], activePlanId?: string }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (searchParams.get('upgrade') === 'true') {
      setSuccess('¡Felicidades! Tu plan ha sido actualizado con éxito. Las nuevas funciones de tu academia ya están activas.');
    }
  }, [searchParams]);

  const handleSubscribe = async (planName: string) => {
    setLoading(planName);
    setError('');
    
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al procesar suscripción');
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  const PLAN_ICONS: Record<string, string> = {
    starter: '🚀',
    growth: '📈',
    scale: '⚡',
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-500 text-sm animate-pulse flex items-center gap-3 font-bold uppercase tracking-widest italic">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-green-400 text-sm animate-fade-in flex items-center gap-3 font-bold uppercase tracking-widest italic shadow-lg shadow-green-500/5">
          <span className="text-xl">✨</span> {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => {
          const isCurrent = activePlanId === plan.id;
          const isProcessing = loading === plan.name;
          
          return (
            <div key={plan.id} className={`relative bg-[#0d1524] rounded-2xl p-6 border-2 transition-all ${isCurrent ? 'border-cyan-500/50' : 'border-blue-500/15 hover:border-blue-500/30'}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  Plan actual
                </div>
              )}
              <div className="text-2xl mb-3">{PLAN_ICONS[plan.name] ?? '💎'}</div>
              <div className="text-lg font-bold text-white mb-1">{plan.displayName}</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                ${Number(plan.monthlyPrice).toLocaleString('es-MX')}
                <span className="text-sm text-gray-500 ml-1">MXN/mes</span>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-green-400">✓</span>
                  {plan.studentLimit === -1 ? 'Alumnos ilimitados' : `Hasta ${plan.studentLimit} alumnos`}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-green-400">✓</span>
                  {plan.commissionRate}% de comisión
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  {plan.aiEnabled ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
                  {plan.name === 'scale' ? 'Full IA + Carga de Documentos' : 'IA para generar cursos'}
                </div>
              </div>
              {!isCurrent && (
                <button 
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={loading !== null}
                  className="mt-5 w-full py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-sm font-semibold text-gray-300 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : `Cambiar a ${plan.displayName}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
