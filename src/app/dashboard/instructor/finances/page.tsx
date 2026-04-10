'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';

function PageContent() {
import { useState, useEffect } , Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err.error || 'No se pudo cargar la informaciÃ³n financiera.');
      }
    } catch (err) {
      setError('Error de Red: No se pudoconectar con el servidor financiero.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFinances();
  }, [userIdFromQuery]);

  if (loading) return <div className="p-20 text-center animate-pulse text-cyan-500 font-mono text-[10px] uppercase tracking-[0.3em]">Sincronizando Libro Contable...</div>;
  if (error) return <div className="p-20 text-center text-red-400 font-black uppercase tracking-widest italic">{error}</div>;
  if (!data) return <div className="p-20 text-center text-gray-600 font-bold uppercase tracking-widest">Iniciando SincronizaciÃ³n Financiera...</div>;

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
      const res = await fetch('/api/instructor/connect-stripe/onboarding');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error generando enlace');
      }
    } catch (err) {
      alert('Error de conexiÃ³n');
    }
  };

  return (
    <div className="animate-fade-in font-poppins space-y-10 pb-32">
        {/* STRIPE CONNECT BANNER */}
        {!profile.stripeOnboardingComplete && (
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl">ðŸ¦</div>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic italic">ConfiguraciÃ³n Bancaria Pendiente</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Conecta tu cuenta de Stripe para recibir tus pagos automÃ¡ticamente en cada venta.</p>
              </div>
            </div>
            <button 
              onClick={handleConnect}
              className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-500/20"
            >
              Conectar Banco â†’
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-4xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">AnÃ¡lisis <span className="text-cyan-400">Financiero</span></h1>
                  <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-[0.3em] italic">Transparencia econÃ³mica y rendimiento de activos acadÃ©micos.</p>
                </div>
                {profile.stripeOnboardingComplete && (
                  <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl flex items-center gap-2 animate-fade-in shadow-lg shadow-green-500/5">
                    <span className="text-green-500 text-sm">âœ…</span>
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest italic">Banco Verificado</span>
                  </div>
                )}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-[#0d1524] hover:bg-cyan-500/10 border border-cyan-500/20 px-6 py-3 rounded-2xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all italic shadow-xl shadow-cyan-500/5"
                >
                  ðŸ“¥ Descargar reporte (CSV)
                </button>
                <div className="flex items-center gap-4 bg-[#0d1524] p-1.5 px-6 rounded-2xl border border-blue-500/10 shadow-2xl">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">ðŸ“Š</div>
                    <div>
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Plan Activo</p>
                      <p className="text-xs font-black text-white uppercase italic">{activeSub?.plan.displayName || 'BÃ¡sico'}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#161b22] border border-white/5 p-10 rounded-[3rem] shadow-3xl group hover:border-cyan-500/30 transition-all relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 italic">Ventas Brutas Totales</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-black text-cyan-400">$</span>
                        <h2 className="text-5xl font-space-grotesk font-black text-white tracking-tighter italic">{totalSales.toLocaleString()}</h2>
                    </div>
                    <div className="mt-8 flex items-center justify-between text-[9px] font-black uppercase tracking-widest italic">
                        <span className="text-green-400">â†‘ {monthlyGross.toLocaleString()} este mes</span>
                        <span className="text-gray-600">Lifetime</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#161b22] border border-white/5 p-10 rounded-[3rem] shadow-3xl group hover:border-red-500/30 transition-all relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 italic">Renta Mensual Activa</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-black text-red-500">$</span>
                        <h2 className="text-5xl font-space-grotesk font-black text-white tracking-tighter italic">{monthlyRent.toLocaleString()}</h2>
                    </div>
                    <div className="mt-8 flex flex-col gap-1 text-[9px] font-black uppercase tracking-widest italic">
                        <span className="text-gray-500">Costo de Infraestructura</span>
                        {expirationDate && (
                          <span className="text-red-400/80">Vencimiento: {new Date(expirationDate).toLocaleDateString()}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-[#0d1524] border border-cyan-500/20 p-10 rounded-[3rem] shadow-2xl group hover:shadow-cyan-500/10 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-blue-600/5"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Utilidad Neta (Acumulada)</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-black text-cyan-400">$</span>
                        <h2 className="text-5xl font-space-grotesk font-black text-white tracking-tighter italic">{netEarnings.toLocaleString()}</h2>
                    </div>
                    <div className="mt-8 flex justify-between items-center italic">
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Post-ComisiÃ³n Platform</span>
                        <span className="text-[9px] text-green-400 font-mono italic">+${monthlyNet.toLocaleString()} (Mes)</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* DISTRIBUTION BY COURSE */}
            <div className="lg:col-span-8 bg-[#161b22] border border-white/5 rounded-[3rem] p-10 shadow-3xl">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-10 italic border-b border-white/5 pb-4">Desglose acumulado por Curso</h3>
                <div className="space-y-6">
                    {coursesWithStudents.map((course:any) => {
                        const courseTransactions = transactions.filter((t:any) => t.courseId === course.id);
                        const courseGross = courseTransactions.reduce((acc:any, t:any) => acc + Number(t.grossAmount), 0);
                        const courseNet = courseTransactions.reduce((acc:any, t:any) => acc + (Number(t.grossAmount) - Number(t.platformCommissionAmount)), 0);
                        const progress = totalSales > 0 ? (courseGross / totalSales) * 100 : 0;
                        
                        return (
                            <div key={course.id} className="p-6 bg-[#070d1a] rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs">ðŸ“–</div>
                                        <div>
                                            <p className="font-bold text-white text-xs uppercase tracking-tight">{course.title}</p>
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1 italic">{course._count.enrollments} Alumnos Totales</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-600 uppercase mb-1 italic">Utilidad Neta</p>
                                        <p className="text-sm font-black text-cyan-400 font-mono italic">${courseNet.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* COMMISSION & FEES */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl relative overflow-hidden">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-8 italic">Transparencia de Tasas</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase italic">ComisiÃ³n Plattform</span>
                            <span className="text-xs font-black text-red-400">-{totalCommission.toLocaleString()} MXN</span>
                        </div>
                        <div className="flex justify-between items-center pb-6 border-b border-white/5 text-[9px] text-gray-600 font-mono italic">
                            <span>Basado en plan {activeSub?.plan.displayName}</span>
                            <span>{Number(activeSub?.plan.commissionRate || 0)}%</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-space-grotesk font-black text-white italic">
                            <span>TOTAL NETO</span>
                            <span>${netEarnings.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed tracking-widest italic text-center">
                            Los fondos son liquidados segÃºn los tÃ©rminos de servicio a tu cuenta Stripe vinculada.
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-1 px-1 rounded-[3rem]">
                    <div className="bg-[#0b0e14] rounded-[2.9rem] p-8 text-center group">
                        <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-3 italic">Mejora tus mÃ¡rgenes</p>
                        <h4 className="text-white font-black text-sm uppercase italic mb-6">Â¿Quieres pagar menos comisiÃ³n?</h4>
                        <Link href="/dashboard/instructor/plan" className="block w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-500/20">
                            Subir de Nivel de Plan
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        {/* LOG DE TRANSACCIONES */}
        <div className="bg-[#161b22] border border-white/5 rounded-[3rem] p-10 shadow-3xl overflow-hidden">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-10 italic border-b border-white/5 pb-4">Historial de Transacciones (Master Log)</h3>
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#161b22] z-10">
                        <tr className="border-b border-white/10">
                            <th className="pb-6 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Fecha / ID</th>
                            <th className="pb-6 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Alumno</th>
                            <th className="pb-6 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Curso / Activo</th>
                            <th className="pb-6 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Bruto</th>
                            <th className="pb-6 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Fee Plat.</th>
                            <th className="pb-6 text-[9px] font-black text-gray-600 uppercase tracking-widest italic text-right">Neto Instructor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                        {transactions.map((t:any) => (
                            <tr key={t.id} className="group hover:bg-white/2 transition-all">
                                <td className="py-6">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(t.createdAt).toLocaleDateString()}</p>
                                    <p className="text-[8px] text-gray-700 font-mono mt-1 italic">{t.id.slice(0,8)}...</p>
                                </td>
                                <td className="py-6">
                                    <p className="text-[10px] text-white font-bold uppercase group-hover:text-cyan-400 transition-colors">{t.user.name} {t.user.lastName}</p>
                                </td>
                                <td className="py-6">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase italic max-w-[200px] truncate">{t.course?.title || 'N/A'}</p>
                                </td>
                                <td className="py-6 text-[10px] font-bold text-gray-300 font-mono">${Number(t.grossAmount).toLocaleString()}</td>
                                <td className="py-6 text-[10px] font-bold text-red-500 font-mono">-${Number(t.platformCommissionAmount).toLocaleString()}</td>
                                <td className="py-6 text-right">
                                    <span className="text-[11px] font-black text-white font-mono bg-white/5 px-4 py-1.5 rounded-lg border border-white/5 italic">${(Number(t.grossAmount) - Number(t.platformCommissionAmount)).toLocaleString()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <style jsx global>{`
           .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
           @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
           .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7); }
           .custom-scrollbar::-webkit-scrollbar { width: 6px; }
           .custom-scrollbar::-webkit-scrollbar-track { background: #0d1524; }
           .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        `}</style>
    </div>
  );
}
}

export default function Page() { return <Suspense fallback={null}><PageContent /></Suspense>; }
