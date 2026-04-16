'use client';

import { useState, useEffect, useMemo } from 'react';
import { exportToCSV, exportToExcel } from '@/lib/export-utils';

export default function AdminRevenueRentPage() {
  const now = new Date();
  const [filters, setFilters] = useState<{ month: number | 'all', year: number | 'all' }>({
    month: now.getMonth(),
    year: now.getFullYear()
  });
  
  const [data, setData] = useState<{ metrics: any, subscriptions: any[] }>({
    metrics: { rentThisMonth: 0, accumulatedYear: 0, expiredCount: 0, selectedPeriod: { month: now.getMonth(), year: now.getFullYear() } },
    subscriptions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchRentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/revenue/rent?month=${filters.month}&year=${filters.year}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching rent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentData();
  }, [filters]);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const years = [2024, 2025, 2026];

  // Cálculo de antigüedad y agregación de alumnos
  const processedSubs = useMemo(() => {
    return data.subscriptions.map(sub => {
      const totalEnrollments = sub.instructor.user.courses?.reduce((acc: number, course: any) => 
        acc + (course._count?.enrollments || 0), 0) || 0;
      
      const regDate = new Date(sub.instructor.user.createdAt);
      const diffTime = Math.abs(now.getTime() - regDate.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.41));

      return {
        ...sub,
        totalEnrollments,
        seniorityMonths: diffMonths,
        registrationDate: regDate
      };
    });
  }, [data.subscriptions]);

  const handleExportCSV = () => {
    const calcStripeFee = (amt: number) => Number(((amt * 0.034) + 3) * 1.16);
    
    const exportData = processedSubs.map(s => {
      const gross = Number(s.plan.monthlyPrice);
      const stripeFee = calcStripeFee(gross);
      const net = gross - stripeFee;
      
      return {
        Instructor: `${s.instructor.user.name} ${s.instructor.user.lastName}`,
        Plan: s.plan.displayName,
        'Monto Bruto': gross.toFixed(2),
        'Fee Stripe (MX)': stripeFee.toFixed(2),
        'Neto Plataforma': net.toFixed(2),
        Estado: s.status,
        'Vence El': s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : 'N/A'
      };
    });
    const monthLabel = filters.month === 'all' ? 'total' : (filters.month as number) + 1;
    exportToCSV(exportData, `plattform-rentas-precision-${monthLabel}-${filters.year}`);
  };

  const handleExportExcel = () => {
    const exportData = processedSubs.map(s => ({
       ID: s.id,
       Instructor: `${s.instructor.user.name} ${s.instructor.user.lastName}`,
       'Academia': s.instructor.academyName,
       Plan: s.plan.displayName,
       Monto: s.plan.monthlyPrice,
       Estado: s.status,
       'Alumnos/:Límite': `${s.totalEnrollments}/${s.plan.studentLimit === -1 ? '∞' : s.plan.studentLimit}`,
       'Registro': s.registrationDate.toLocaleDateString(),
       'Antigüedad (Meses)': s.seniorityMonths,
       'Vence El': s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : 'N/A'
    }));
    const monthLabel = filters.month === 'all' ? 'total' : (filters.month as number) + 1;
    exportToExcel(exportData, `plattform-rentas-${monthLabel}-${filters.year}`, 'Rentas');
  };

  return (
    <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0b1120] border border-blue-500/10 p-8 rounded-3xl shadow-xl">
           <div className="flex flex-col md:flex-row md:items-center gap-6">
              <h1 className="text-3xl font-space-grotesk font-bold shrink-0">RECAUDACIÓN</h1>
              
              <div className="flex items-center gap-3">
                 <select 
                   value={filters.month} 
                   onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value === 'all' ? 'all' : parseInt(e.target.value) }))}
                   className="bg-black border border-cyan-500/30 text-white rounded-xl text-xs px-4 py-2 outline-none transition-all cursor-pointer hover:border-cyan-400 font-bold"
                 >
                    <option value="all" className="bg-black text-white">Todo (Mes)</option>
                    {months.map((m, i) => <option key={i} value={i} className="bg-black text-white">{m}</option>)}
                 </select>
                 <select 
                   value={filters.year} 
                   onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value === 'all' ? 'all' : parseInt(e.target.value) }))}
                   className="bg-black border border-cyan-500/30 text-white rounded-xl text-xs px-4 py-2 outline-none transition-all cursor-pointer hover:border-cyan-400 font-bold"
                 >
                    <option value="all" className="bg-black text-white">Todo (Año)</option>
                    {years.map(y => <option key={y} value={y} className="bg-black text-white">{y}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="flex gap-3">
              <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-blue-500/10 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all uppercase tracking-widest leading-none">Exportar CSV</button>
              <button onClick={handleExportExcel} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0d1524] border border-green-500/10 hover:border-green-500/50 hover:bg-green-600/10 transition-all uppercase tracking-widest leading-none">Exportar Excel</button>
           </div>
        </div>

        {/* KPIs RENTAS CON REDISEÑO DE ÉLITE - 3 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[#0b1120] border border-cyan-500/20 p-8 rounded-3xl shadow-xl shadow-cyan-500/5 relative overflow-hidden group">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Recaudación Seleccionada</p>
              <p className="text-4xl font-black text-white tracking-tighter italic animate-in fade-in slide-in-from-left duration-700" suppressHydrationWarning>
                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.metrics.rentThisMonth)}
              </p>
              <div className="mt-4 h-1 w-12 bg-cyan-500 rounded-full"></div>
           </div>
           
           <div className="bg-[#0b1120] border border-emerald-500/20 p-8 rounded-3xl shadow-xl shadow-emerald-500/5">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Utilidad Neta (Plataforma)</p>
              <p className="text-3xl font-black text-emerald-400 tracking-tighter italic" suppressHydrationWarning>
                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.metrics.netRevenueThisMonth || 0)}
              </p>
              <p className="text-[9px] text-gray-600 mt-2 uppercase">Tras Stripe MX Fee e IVA</p>
           </div>

           <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl shadow-xl shadow-red-500/5">
              <p className="text-[10px] font-black text-red-100/40 uppercase tracking-widest mb-2">Suscripciones Críticas</p>
              <p className="text-3xl font-black text-red-500 tracking-tighter italic">{data.metrics.expiredCount}</p>
              <p className="text-[9px] text-red-500/40 mt-2 uppercase tracking-tighter">Vencidas / Morosas</p>
           </div>
        </div>

       {/* TABLA DE RENTAS EXTENDIDA */}
       <div className="bg-[#0d1524] border border-blue-500/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead className="bg-[#152035]/50 border-b border-blue-500/10">
                <tr>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Instructor / Academia</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Plan actual</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Monto del Plan</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Uso (Alumnos/Límite)</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Estado</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Registro</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Vencimiento</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Meses</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-blue-500/5 text-sm">
                {loading ? (
                   <tr>
                      <td colSpan={8} className="p-24 text-center">
                         <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Cargando inteligencia financiera...</span>
                         </div>
                      </td>
                   </tr>
                ) : processedSubs.map(sub => (
                   <tr key={sub.id} className="hover:bg-blue-600/5 transition-all group">
                      <td className="p-6">
                         <p className="font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">{sub.instructor.user.name} {sub.instructor.user.lastName}</p>
                         <p className="text-[10px] text-cyan-400 font-black tracking-widest uppercase italic">{sub.instructor.academyName}</p>
                      </td>
                      <td className="p-6">
                         <span className="text-[9px] font-black bg-blue-500/10 text-cyan-400 px-3 py-1 rounded-full border border-blue-500/20 italic uppercase tracking-tighter">
                            {sub.plan.displayName}
                         </span>
                      </td>
                      <td className="p-6 font-mono text-gray-300 font-bold" suppressHydrationWarning>
                         ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(sub.plan.monthlyPrice))}
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col gap-1.5 w-32">
                            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest leading-none">
                               <span className={`${sub.totalEnrollments >= sub.plan.studentLimit && sub.plan.studentLimit !== -1 ? 'text-red-400' : 'text-cyan-400'} text-sm`}>
                                  {sub.totalEnrollments}
                               </span>
                               <span className="text-gray-500 font-medium">/ {sub.plan.studentLimit === -1 ? '∞' : sub.plan.studentLimit}</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full transition-all duration-700 ${
                                   sub.plan.studentLimit === -1 ? 'bg-indigo-500' :
                                   (sub.totalEnrollments / sub.plan.studentLimit) >= 0.9 ? 'bg-red-500' : 'bg-cyan-500'
                                 }`} 
                                 style={{ width: `${sub.plan.studentLimit === -1 ? 100 : Math.min((sub.totalEnrollments / sub.plan.studentLimit) * 100, 100)}%` }}
                                ></div>
                            </div>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-[0.1em] ${
                             sub.status === 'ACTIVE' ? 'text-green-400 border-green-400/20 bg-green-400/5' : 
                             sub.status === 'PAST_DUE' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                             'text-red-500 border-red-500/20 bg-red-500/5'
                         }`}>
                           {sub.status === 'ACTIVE' ? 'ACTIVA' : sub.status === 'PAST_DUE' ? 'MOROSO' : 'VENCIDA'}
                         </span>
                      </td>
                      <td className="p-6 text-[11px] font-bold text-gray-500 uppercase tracking-tighter italic">
                         {sub.registrationDate.toLocaleDateString()}
                      </td>
                      <td className="p-6 text-[11px] font-bold text-gray-400 uppercase tracking-tighter italic">
                         {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'INDETERMINADO'}
                      </td>
                      <td className="p-6 text-right">
                         <span className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-xl font-black font-mono border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] inline-block min-w-[60px] text-center">
                            {sub.seniorityMonths}m
                         </span>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}
