'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatMXN } from '@/lib/utils/currency';

function FinancesContent() {
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('connect_status');
    if (status === 'success') {
      alert('¡Cuenta de Stripe conectada con éxito! Ahora puedes recibir pagos.');
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (status === 'refresh') {
      alert('El proceso de conexión se reinició. Por favor, intenta de nuevo.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const url = userIdFromQuery ? `/api/instructor/finances?userId=${userIdFromQuery}` : '/api/instructor/finances';
      const res = await fetch(url);
      if (res.ok) {
          const json = await res.json();
          setData(json);
      } else {
        const err = await res.json();
        setError(err.error || 'No se pudo cargar la información financiera.');
      }
    } catch (err) {
      setError('Error de Red: No se pudo conectar con el servidor financiero.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFinances();
  }, [userIdFromQuery]);

  if (loading) return <div className="p-20 text-center animate-pulse text-cyan-500 font-mono text-[10px] uppercase tracking-[0.3em]">Sincronizando Libro Contable...</div>;
  if (error) return <div className="p-20 text-center text-red-400 font-black uppercase tracking-widest italic">{error}</div>;
  if (!data) return <div className="p-20 text-center text-gray-600 font-bold uppercase tracking-widest">Iniciando Sincronización Financiera...</div>;

  const { profile, activeSub, monthlyRent, expirationDate, totalSales, totalCommission, netEarnings, monthlyGross, monthlyNet, coursesWithStudents, transactions } = data;

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;
    const headers = ["Fecha", "Curso", "Alumno", "Monto Bruto", "Comision Plataforma", "Utilidad Neta"];
    const rows = transactions.map((t: any) => [
      new Date(t.createdAt).toLocaleDateString(),
      t.course?.title || 'N/A',
      `${t.user.name} ${t.user.lastName}`,
      t.grossAmount,
      t.platformCommissionAmount,
      (Number(t.grossAmount) - Number(t.platformCommissionAmount)).toFixed(2)
    ]);
    
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map((val: any) => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_finanzas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/instructor/connect-stripe', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirige a Stripe
      } else {
        alert(data.error || 'Error generando enlace');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="animate-fade-in font-poppins space-y-10 pb-32">
        {!profile.stripeOnboardingComplete && (
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl">🏦</div>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic">Configuración Bancaria Pendiente</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Conecta tu cuenta de Stripe para recibir tus pagos automáticamente en cada venta.</p>
              </div>
            </div>
            <button onClick={handleConnect} className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-500/20">
              Conectar Banco →
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Análisis <span className="text-cyan-400">Financiero</span></h1>
              <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-[0.3em] italic">Rendimiento de activos académicos.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <button onClick={handleExportCSV} className="bg-[#0d1524] hover:bg-cyan-500/10 border border-cyan-500/20 px-6 py-3 rounded-2xl text-[10px] font-black text-cyan-400 uppercase tracking-widest italic transition-all">
                  📥 Exportar CSV
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#0d1524] border border-blue-500/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-4xl group-hover:scale-110 transition-transform">💎</div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Estado de Suscripción</p>
                <h2 className="text-2xl font-space-grotesk font-black text-white tracking-tighter italic uppercase">
                  {profile.user.isCourtesy ? 'Cortesía 🔥' : (activeSub?.plan?.name || 'Starter')}
                </h2>
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    {profile.user.isCourtesy ? 'Acceso Premium Total' : (
                      expirationDate 
                        ? `Vencimiento: ${new Date(expirationDate).toLocaleDateString('es-MX')}`
                        : 'Sin vencimiento activo'
                    )}
                  </span>
                  {activeSub?.status === 'PAUSED' && (
                    <span className="text-[9px] font-black text-amber-500 uppercase italic animate-pulse">Plan Pausado (Remanente: {activeSub.pausedRemainingDays} días)</span>
                  )}
                </div>
            </div>
            <div className="bg-[#161b22] border border-white/5 p-10 rounded-[3rem] shadow-3xl">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 italic">Ventas Brutas</p>
                <h2 className="text-5xl font-space-grotesk font-black text-white tracking-tighter italic">{formatMXN(totalSales)}</h2>
            </div>
            <div className="bg-[#161b22] border border-white/5 p-10 rounded-[3rem] shadow-3xl">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 italic">Renta Mensual</p>
                <h2 className="text-5xl font-space-grotesk font-black text-white tracking-tighter italic">{formatMXN(monthlyRent)}</h2>
            </div>
            <div className="bg-[#0d1524] border border-cyan-500/20 p-10 rounded-[3rem] shadow-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Utilidad Neta</p>
                <h2 className="text-5xl font-space-grotesk font-black text-white tracking-tighter italic">{formatMXN(netEarnings)}</h2>
            </div>
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-[3rem] p-10 shadow-3xl">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-10 italic border-b border-white/5 pb-4">Historial de Transacciones</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
                            <th className="pb-6">Fecha</th>
                            <th className="pb-6">Alumno</th>
                            <th className="pb-6">Curso</th>
                            <th className="pb-6 text-center">Total Pagado</th>
                            <th className="pb-6 text-center">Comisión Plattform</th>
                            <th className="pb-6 text-right">Tu Neto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                        {transactions.map((t:any) => {
                          const rate = Number(t.platformCommissionRate) > 0 
                            ? Number(t.platformCommissionRate) 
                            : (effectivePlan ? Number(effectivePlan.commissionRate) : 15);
                          const net = Number(t.grossAmount) - Number(t.platformCommissionAmount);
                          
                          return (
                            <tr key={t.id} className="group hover:bg-white/2 transition-all">
                                <td className="py-6 text-[10px] text-gray-400 font-bold">{new Date(t.createdAt).toLocaleDateString()}</td>
                                <td className="py-6 text-[10px] text-white font-bold">{t.user.name} {t.user.lastName}</td>
                                <td className="py-6 text-[10px] text-gray-400 italic">{t.course?.title || 'N/A'}</td>
                                <td className="py-6 text-center text-[10px] text-gray-300 font-mono" suppressHydrationWarning>{formatMXN(t.grossAmount)}</td>
                                <td className="py-6 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-black text-red-400/60 uppercase">-{rate}%</span>
                                    <span className="text-[10px] font-bold text-gray-500" suppressHydrationWarning>{formatMXN(t.platformCommissionAmount)}</span>
                                  </div>
                                </td>
                                <td className="py-6 text-right text-[11px] font-black text-cyan-400" suppressHydrationWarning>{formatMXN(net)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        <style jsx global>{`
          .animate-fade-in { animation: fadeIn 0.8s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7); }
        `}</style>
    </div>
  );
}

export default function FinancesPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center animate-pulse text-cyan-500 font-mono text-[10px] uppercase tracking-[0.3em]">
        Cargando Libro Contable...
      </div>
    }>
      <FinancesContent />
    </Suspense>
  );
}