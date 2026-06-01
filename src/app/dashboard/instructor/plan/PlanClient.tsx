'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formatMXN } from '@/lib/utils/currency';

export default function PlanClient({ 
  plans, 
  activePlanId,
  expirationDate,
  isCancelledAtPeriodEnd: initialIsCancelled = false
}: { 
  plans: any[], 
  activePlanId?: string,
  expirationDate?: string | null,
  isCancelledAtPeriodEnd?: boolean
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDowngradeModal, setShowDowngradeModal] = useState<string | null>(null);
  
  const [isCancelled, setIsCancelled] = useState(initialIsCancelled);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const activePlan = plans.find(p => p.id === activePlanId);

  useEffect(() => {
    const successParam = searchParams.get('success');
    const canceledParam = searchParams.get('canceled');
    
    if (successParam === 'true') {
      setSuccess('¡Felicidades! Tu suscripción ha sido activada/actualizada con éxito. Ya puedes disfrutar de todos los beneficios de tu plan.');
    }
    if (canceledParam === 'true') {
      setError('El proceso de pago fue cancelado. No se realizaron cargos.');
    }
  }, [searchParams]);

  const handleSubscribe = async (planId: string, confirmedDowngrade = false) => {
    const targetPlan = plans.find(p => p.id === planId);
    
    // Si es un Downgrade y no ha sido confirmado aún, mostrar Modal de Advertencia
    if (activePlan && targetPlan && !confirmedDowngrade) {
        if (Number(targetPlan.monthlyPrice) < Number(activePlan.monthlyPrice)) {
            setShowDowngradeModal(planId);
            return;
        }
    }

    setLoading(planId);
    setError('');
    setSuccess('');
    setShowDowngradeModal(null);
    
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
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

  const handleToggleSubscriptionAutoRenewal = async (action: 'cancel' | 'reactivate') => {
    setCancelLoading(true);
    setError('');
    setSuccess('');
    setShowConfirmCancelModal(false);
    
    try {
      const res = await fetch('/api/checkout/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al procesar la solicitud');
      
      setIsCancelled(action === 'cancel');
      setSuccess(data.message || 'Operación realizada con éxito.');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
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
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-cyan-500/20 uppercase tracking-widest whitespace-nowrap">
                  ⭐ Tu Plan Actual
                </div>
              )}
              <div className="text-2xl mb-3">{PLAN_ICONS[plan.name] ?? '💎'}</div>
              <div className="text-lg font-bold text-white mb-1">{plan.displayName}</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                {formatMXN(plan.monthlyPrice)}
                <span className="text-sm text-gray-500 ml-1">MXN/mes</span>
              </div>
              {isCurrent && expirationDate && (
                <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1 ${isCancelled ? 'text-orange-400' : 'text-cyan-400'}`}>
                   <span className={isCancelled ? '' : 'animate-pulse'}>●</span> {isCancelled ? 'Expira el' : 'Renovación el'}: {new Date(expirationDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-green-400">✓</span>
                  {plan.studentLimit === -1 ? 'Alumnos ilimitados' : `Hasta ${plan.studentLimit} alumnos`}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-green-400">✓</span>
                  {Number(plan.commissionRate)}% de comisión
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  {plan.aiEnabled ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
                  {plan.name === 'scale' ? 'Full IA + Carga de Documentos' : 'IA para generar cursos'}
                </div>
              </div>
              
              {isCurrent ? (
                <div className="flex flex-col gap-2 mt-8">
                  <button 
                    disabled 
                    className="w-full py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] opacity-80 cursor-default"
                  >
                    Suscripción Activa
                  </button>
                  
                  {isCancelled ? (
                    <button
                      onClick={() => handleToggleSubscriptionAutoRenewal('reactivate')}
                      disabled={cancelLoading}
                      className="w-full py-3.5 rounded-2xl bg-green-600/10 border border-green-600/20 hover:bg-green-600 hover:border-green-600 text-[10px] font-black text-white hover:scale-[1.01] transition-all uppercase tracking-[0.2em] shadow-lg disabled:opacity-50"
                    >
                      {cancelLoading ? 'Procesando...' : 'Reactivar Renovación'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmCancelModal(true)}
                      disabled={cancelLoading}
                      className="w-full py-3.5 rounded-2xl bg-red-600/5 border border-red-600/20 hover:bg-red-600/10 text-[10px] font-black text-red-400 hover:text-white hover:scale-[1.01] transition-all uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                      {cancelLoading ? 'Procesando...' : 'Desactivar Renovación'}
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading !== null}
                  className="mt-8 w-full py-4 rounded-2xl bg-blue-600/10 border border-blue-500/10 text-[10px] font-black text-white hover:bg-blue-600 hover:border-blue-600 hover:scale-[1.02] transition-all disabled:opacity-50 uppercase tracking-[0.2em] shadow-lg shadow-blue-500/5"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-current animate-ping" /> Procesando...
                    </span>
                  ) : (activePlan ? `Migrar a ${plan.displayName}` : `Obtener Plan ${plan.displayName}`)}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showDowngradeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#070d1a]/85 backdrop-blur-xl animate-fade-in">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl shadow-cyan-500/5 relative overflow-hidden group">
             {/* Decorative Background */}
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-600/5 blur-[80px] rounded-full group-hover:bg-cyan-600/10 transition-all duration-700" />
             
             <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 mb-8">
                   <span className="text-4xl">⚠️</span>
                </div>
                
                <h3 className="text-2xl font-space-grotesk font-black text-white mb-4 italic uppercase tracking-tighter">¿CONFIRMAR BAJA DE PLAN?</h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light tracking-wide text-left">
                   Estás a punto de bajar de nivel al plan <span className="text-cyan-400 font-bold">{plans.find(p => p.id === showDowngradeModal)?.displayName || 'Básico'}</span>. 
                   <br/><br/>
                   <span className="text-white font-black uppercase tracking-widest text-[10px] block mb-4 border-b border-white/5 pb-2">Reglas de reinicio de ciclo:</span>
                   <span className="block mb-2">1. Se realizará un <span className="text-red-400 font-bold">cobro inmediato</span> por el monto total del nuevo plan.</span>
                   <span className="block mb-2">2. Tu ciclo de facturación <span className="text-cyan-400 font-bold">se reinicia hoy</span> (Hoy + 30 días).</span>
                   <span className="block mb-2">3. <span className="text-red-500 font-bold underline">Perderás el tiempo remanente</span> de tu plan actual prepagado.</span>
                </p>
 
                <div className="space-y-4">
                  <button 
                    onClick={() => handleSubscribe(showDowngradeModal, true)}
                    className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl text-xs font-black text-white hover:scale-105 transition-all shadow-xl shadow-red-600/20 uppercase tracking-[0.2em]"
                  >
                    Acepto perder mi tiempo actual y Reiniciar Ciclo
                  </button>
                  <button 
                    onClick={() => setShowDowngradeModal(null)}
                    className="w-full py-5 border border-cyan-500/50 hover:bg-cyan-500/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all"
                  >
                    Mantener mi plan actual
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {showConfirmCancelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#070d1a]/85 backdrop-blur-xl animate-fade-in">
          <div className="bg-[#0d1524] border border-red-500/30 rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/5 blur-[80px] rounded-full" />
             
             <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-600/10 border border-red-600/20 mb-8">
                   <span className="text-4xl">⚠️</span>
                </div>
                
                <h3 className="text-2xl font-space-grotesk font-black text-white mb-4 italic uppercase tracking-tighter">¿DESACTIVAR RENOVACIÓN AUTOMÁTICA?</h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light tracking-wide text-left">
                   Estás a punto de desactivar la renovación automática de tu suscripción actual. 
                   <br/><br/>
                   <span className="text-white font-black uppercase tracking-widest text-[10px] block mb-4 border-b border-white/5 pb-2">Ten en cuenta lo siguiente:</span>
                   <span className="block mb-2 flex gap-2"><span>•</span> <span>Mantendrás acceso completo a todas las funciones hasta que finalice el periodo actual.</span></span>
                   <span className="block mb-2 flex gap-2"><span>•</span> <span>Al vencer la suscripción, tus cursos pasarán a estar **hibernados** y no podrás editarlos ni registrar nuevos alumnos hasta reactivar tu plan.</span></span>
                   <span className="block mb-2 flex gap-2"><span>•</span> <span>**No se realizarán más cargos automáticos** en tu tarjeta de crédito o débito.</span></span>
                </p>
 
                <div className="space-y-4">
                  <button 
                    onClick={() => handleToggleSubscriptionAutoRenewal('cancel')}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl text-xs font-black text-white hover:scale-105 transition-all shadow-xl shadow-red-600/20 uppercase tracking-[0.2em]"
                  >
                    Confirmar: Desactivar Renovación
                  </button>
                  <button 
                    onClick={() => setShowConfirmCancelModal(false)}
                    className="w-full py-5 border border-cyan-500/50 hover:bg-cyan-500/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all"
                  >
                    Mantener Activa la Suscripción
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
