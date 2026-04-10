'use client';

import { useState, useEffect, useMemo } from 'react';
import { exportToCSV, exportToExcel } from '@/lib/export-utils';

export default function AdminRevenueCommissionsPage() {
  const now = new Date();
  const [filters, setFilters] = useState({
    month: now.getMonth().toString(),
    year: now.getFullYear().toString()
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [data, setData] = useState<{ metrics: any, instructors: any[] }>({
    metrics: { totalGross: 0, totalCommissions: 0, prevMonthCommissions: 0, salesCount: 0, averageSale: 0, isHistorical: false },
    instructors: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/revenue/commissions?month=${filters.month}&year=${filters.year}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching commission data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const months = [
    { label: 'Todo', value: 'all' },
    { label: 'Enero', value: '0' },
    { label: 'Febrero', value: '1' },
    { label: 'Marzo', value: '2' },
    { label: 'Abril', value: '3' },
    { label: 'Mayo', value: '4' },
    { label: 'Junio', value: '5' },
    { label: 'Julio', value: '6' },
    { label: 'Agosto', value: '7' },
    { label: 'Septiembre', value: '8' },
    { label: 'Octubre', value: '9' },
    { label: 'Noviembre', value: '10' },
    { label: 'Diciembre', value: '11' }
  ];

  const years = [
    { label: 'Histórico', value: 'all' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' }
  ];

  const filteredInstructors = useMemo(() => {
     if (!searchTerm) return data.instructors;
     const lowerTerm = searchTerm.toLowerCase();
     return data.instructors.filter(i => 
        i.instructorName.toLowerCase().includes(lowerTerm) || 
        i.academyName.toLowerCase().includes(lowerTerm)
     );
  }, [data.instructors, searchTerm]);

  // Cálculo de tendencia
  const trend = useMemo(() => {
    const current = data.metrics.totalCommissions;
    const prev = data.metrics.prevMonthCommissions;
    if (prev === 0) return current > 0 ? 100 : 0;
    return ((current - prev) / prev) * 100;
  }, [data.metrics.totalCommissions, data.metrics.prevMonthCommissions]);

  const handleExportCSV = () => {
    const exportData = filteredInstructors.map(c => ({
       Instructor: c.instructorName,
       Academia: c.academyName,
       Ventas: c.salesCount,
       Bruto: c.grossAmount,
       Comisión: c.platformCommission,
       Neto: c.netAmount,
       'Tasa %': c.commissionRate
    }));
    exportToCSV(exportData, `plattform-comisiones-${filters.month}-${filters.year}`);
  };

  const handleExportExcel = () => {
    const exportData = filteredInstructors.map(c => ({
       Instructor: c.instructorName,
       Academia: c.academyName,
       Ventas: c.salesCount,
       Bruto: c.grossAmount,
       Comisión: c.platformCommission,
       Neto: c.netAmount,
       'Tasa %': c.commissionRate
    }));
    exportToExcel(exportData, `plattform-comisiones-${filters.month}-${filters.year}`, 'Comisiones');
  };

  return (
    <div className="space-y-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-space-grotesk font-bold">Comisiones por <span className="text-cyan-400">Venta</span></h1>
             <p className="text-gray-400 mt-2 font-light tracking-wide uppercase text-[10px] tracking-[0.2em] italic">Análisis de dispersión de ingresos transaccionales.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <input 
                  type="text"
                  placeholder="Buscar instructor o academia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/40 border border-secondary/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all w-64 pl-10"
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <div className="flex gap-2">
                <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-secondary/10 hover:border-secondary/50 hover:bg-secondary/10 transition-all uppercase tracking-widest leading-none">Exportar CSV</button>
                <button onClick={handleExportExcel} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0d1524] border border-green-500/10 hover:border-green-500/50 hover:bg-green-600/10 transition-all uppercase tracking-widest leading-none">Exportar Excel</button>
             </div>
          </div>
       </div>

       {/* KPIs COMISIONES CON REDISEÑO DE ÉLITE */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Principal de Comisiones */}
          <div className="bg-[#0b1120] border border-cyan-500/20 p-8 rounded-3xl shadow-xl shadow-cyan-500/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
             <div className="absolute top-6 right-6 flex gap-2 z-20">
                <select 
                  value={filters.month} 
                  onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                  className="bg-black border border-cyan-500/30 text-white rounded-lg text-[10px] px-3 py-1.5 outline-none transition-all cursor-pointer hover:border-cyan-400 font-bold"
                >
                   {months.map(m => <option key={m.value} value={m.value} className="bg-black">{m.label}</option>)}
                </select>
                <select 
                  value={filters.year} 
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="bg-black border border-cyan-500/30 text-white rounded-lg text-[10px] px-3 py-1.5 outline-none transition-all cursor-pointer hover:border-cyan-400 font-bold"
                >
                   {years.map(y => <option key={y.value} value={y.value} className="bg-black">{y.label}</option>)}
                </select>
             </div>

             <div className="relative z-10 pr-40">
                <p className="text-xs font-bold text-gray-500 tracking-wide mb-1">Comisiones Netas</p>
                <div className="flex flex-col items-center justify-center py-4">
                   <p className="text-5xl font-black text-white tracking-tighter italic animate-in fade-in zoom-in duration-700" suppressHydrationWarning>
                     ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.metrics.totalCommissions)}
                   </p>
                   
                   {/* Indicador de Tendencia Dinámico (Ocultar si es histórico) */}
                   {!data.metrics.isHistorical && (
                    <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${trend >= 0 ? 'text-cyan-400' : 'text-red-500'}`} suppressHydrationWarning>
                        <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%</span>
                        <span className="text-gray-600 font-medium whitespace-nowrap">vs {months.find(m => m.value === (parseInt(filters.month) === 0 ? '11' : (parseInt(filters.month) - 1).toString()))?.label}</span>
                    </div>
                   )}
                   {data.metrics.isHistorical && (
                     <div className="mt-2 text-[10px] font-black text-cyan-400/40 uppercase tracking-[0.3em]">Vista Global Acumulada</div>
                   )}
                </div>
             </div>

             <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <p className="text-[9px] text-gray-600 font-medium tracking-tight">Total acumulado y procesado vía Stripe Connect</p>
                <div className="w-8 h-1 bg-cyan-500/30 rounded-full"></div>
             </div>
             
             {/* Decoración Neón de Fondo */}
             <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all duration-1000"></div>
          </div>

          <div className="bg-[#0b1120] border border-secondary/10 p-8 rounded-3xl shadow-xl shadow-secondary/5 min-h-[220px] flex flex-col justify-between">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Bruto Transaccionado</p>
             <div className="flex flex-col items-center">
                <p className="text-4xl font-bold text-gray-300 tracking-tighter italic" suppressHydrationWarning>
                   ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.metrics.totalGross)}
                </p>
                <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-[0.2em] font-bold font-mono">Volumen Operativo</p>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gray-700 w-2/3 rounded-full"></div>
             </div>
          </div>

          <div className="bg-[#0b1120] border border-emerald-500/10 p-8 rounded-3xl shadow-xl shadow-emerald-500/5 min-h-[220px] flex flex-col justify-between">
             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Promedio por Venta</p>
             <div className="flex flex-col items-center">
                <p className="text-4xl font-bold text-emerald-400 tracking-tighter italic" suppressHydrationWarning>
                   ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.metrics.averageSale)}
                </p>
                <p className="text-[9px] text-emerald-500/40 mt-2 uppercase tracking-[0.1em] font-bold">{data.metrics.salesCount} ops exitosas</p>
             </div>
             <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>)}
             </div>
          </div>
       </div>

       {/* TABLA DE COMISIONES */}
       <div className="bg-[#0b1120] border border-blue-900/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead className="bg-[#152035]/50 border-b border-secondary/10">
                <tr>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Instructor / Academia</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Ventas</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Volumen Bruto</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center bg-cyan-500/5">Tasa %</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Comisión Plattform</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">LIQUIDADO (STRIPE)</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Auditar</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-secondary/5 text-sm">
                {loading ? (
                   <tr>
                      <td colSpan={7} className="p-24 text-center">
                         <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] italic">Auditoría financiera en curso...</span>
                         </div>
                      </td>
                   </tr>
                ) : filteredInstructors.length === 0 ? (
                   <tr>
                      <td colSpan={7} className="p-24 text-center text-gray-500 text-xs italic">No se encontraron resultados para "{searchTerm}"</td>
                   </tr>
                ) : filteredInstructors.map((comm) => (
                   <React.Fragment key={comm.instructorId}>
                      <tr className={`hover:bg-secondary/5 transition-all group ${expandedId === comm.instructorId ? 'bg-secondary/5' : ''}`}>
                         <td className="p-6">
                            <p className="font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">{comm.instructorName}</p>
                            <p className="text-[10px] text-cyan-500/60 font-black tracking-widest uppercase italic">{comm.academyName}</p>
                         </td>
                         <td className="p-6 text-center">
                            <span className="text-[11px] font-black bg-secondary/10 text-cyan-400 px-3 py-1 rounded-full border border-secondary/20 italic">
                               {comm.salesCount} ops
                            </span>
                         </td>
                         <td className="p-6 font-mono text-gray-300 font-bold" suppressHydrationWarning>
                            ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(comm.grossAmount || 0)}
                         </td>
                         <td className="p-6 text-center bg-cyan-500/5">
                            <span className="text-[10px] font-black text-cyan-400">
                               {comm.commissionRate}%
                            </span>
                         </td>
                         <td className="p-6">
                            <div className="flex flex-col">
                               <span className="font-black text-xl text-white tracking-tighter" suppressHydrationWarning>
                                 ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(comm.platformCommission || 0)}
                               </span>
                               <span className="text-[8px] text-cyan-500/40 uppercase tracking-[0.2em] font-black leading-none mt-1">SaaS Fee Retenido</span>
                            </div>
                         </td>
                         <td className="p-6">
                            <div className="flex flex-col">
                               <span className="font-black text-xl text-emerald-400 tracking-tighter" suppressHydrationWarning>
                                 ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(comm.netAmount || 0)}
                               </span>
                               <span className="text-[8px] text-emerald-500/40 uppercase tracking-[0.1em] font-black mt-1">Dispersión Automática</span>
                            </div>
                         </td>
                         <td className="p-6 text-right">
                            <button 
                              onClick={() => setExpandedId(expandedId === comm.instructorId ? null : comm.instructorId)}
                              className={`p-2 rounded-lg transition-all ${expandedId === comm.instructorId ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400 hover:text-cyan-400'}`}
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                               </svg>
                            </button>
                         </td>
                      </tr>
                      
                      {/* FILA DE DESGLOSE EXPANDIBLE */}
                      {expandedId === comm.instructorId && (
                        <tr className="bg-black/40 animate-in slide-in-from-top-4 duration-300">
                           <td colSpan={7} className="p-8 border-t border-secondary/10">
                              <div className="grid grid-cols-1 gap-6">
                                 <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Detalle de Operaciones (Stripe Sync)</h4>
                                    <span className="text-[10px] text-gray-600 font-mono">
                                      Periodo: {filters.month === 'all' ? 'Todo' : months.find(m => m.value === filters.month)?.label} {filters.year === 'all' ? 'Histórico' : filters.year}
                                    </span>
                                 </div>
                                 <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0d1524]">
                                    <table className="w-full text-left text-xs">
                                       <thead className="bg-[#152035] text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                          <tr>
                                             <th className="p-4">Curso Vendido</th>
                                             <th className="p-4 text-center">Fecha</th>
                                             <th className="p-4 text-center">Bruto</th>
                                             <th className="p-4 text-center">Comisión</th>
                                             <th className="p-4 text-right">Stripe Payment Intent</th>
                                          </tr>
                                       </thead>
                                       <tbody className="divide-y divide-white/5">
                                          {comm.transactions.map((t: any) => (
                                             <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-bold text-gray-300">{t.courseTitle}</td>
                                                <td className="p-4 text-center text-gray-500 font-mono">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-center text-white font-mono" suppressHydrationWarning>
                                                   ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(t.amount)}
                                                </td>
                                                <td className="p-4 text-center text-cyan-500 font-mono" suppressHydrationWarning>
                                                   -${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(t.commission)}
                                                </td>
                                                <td className="p-4 text-right">
                                                   <span className="text-[10px] font-mono text-gray-600 px-2 py-1 bg-black/50 rounded border border-white/5">
                                                      {t.stripeId}
                                                   </span>
                                                </td>
                                             </tr>
                                          ))}
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </td>
                        </tr>
                      )}
                   </React.Fragment>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

import React from 'react';
