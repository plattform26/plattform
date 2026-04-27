'use client';

import { useState, useEffect } from 'react';
import { exportToCSV } from '@/lib/export-utils';
import { formatMXN } from '@/lib/utils/currency';

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [totalNeto, setTotalNeto] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (typeFilter) q.append('type', typeFilter);
      if (statusFilter) q.append('status', statusFilter);
      
      const res = await fetch(`/api/admin/transactions?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTxs(data);
        
        // Calcular Total Neto Reactivo (Solo transacciones exitosas)
        const total = data
          .filter((tx: any) => tx.paymentStatus === 'SUCCESS')
          .reduce((acc: number, tx: any) => acc + Number(tx.grossAmount), 0);
        setTotalNeto(total);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, statusFilter]);

  const handleExportCSV = () => {
    const exportData = txs.map(t => {
       const planName = t.user.instructorProfile?.subscriptions[0]?.plan?.displayName || 'Plattform';
       return {
          ID: t.id,
          Fecha: new Date(t.createdAt).toLocaleString(),
          Usuario: `${t.user.name} ${t.user.lastName}`,
          Rol: t.user.role,
          Email: t.user.email,
          Tipo: t.paymentType === 'COURSE_PURCHASE' ? 'Venta de Curso' : 'Renta Instructor',
          Detalle: t.paymentType === 'COURSE_PURCHASE' 
             ? `Inscripción: ${t.course?.title || 'Curso'}` 
             : `💎 Renta Mensual - ${planName}`,
          'Monto Bruto': t.grossAmount,
          'Comisión Plattform': t.platformCommissionAmount,
          'Neto Instructor': t.netAmountToInstructor,
          Estado: t.paymentStatus,
          'Stripe ID': t.stripePaymentIntentId || t.stripeSessionId || 'Manual/Log'
       };
    });
    exportToCSV(exportData, `plattform-ledger-${new Date().toISOString().split('T')[0]}`);
  };


  return (
    <div className="space-y-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-space-grotesk font-bold">Bitácora <span className="text-cyan-400">Financiera</span></h1>
             <p className="text-gray-400 mt-2 font-light tracking-wide">Historial global de movimientos y dispersión de fondos.</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-blue-500/10 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all uppercase tracking-widest leading-none">Exportar CSV</button>
          </div>
       </div>

       {/* TOTALIZADOR DINÁMICO NEÓN */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-r from-[#0d1524] to-[#0a0f1a] border border-cyan-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-cyan-500/5">
             <div className="absolute top-0 right-0 p-10 opacity-10 blur-3xl bg-cyan-500 rounded-full group-hover:opacity-20 transition-opacity" />
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2">Libro Contable Maestro</p>
                   <h2 className="text-4xl md:text-5xl font-space-grotesk font-black text-white italic tracking-tighter">
                      TOTAL NETO <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">ACUMULADO</span>
                   </h2>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Volumen de Operación</p>
                   <div className="text-4xl md:text-5xl font-space-grotesk font-black text-[#00f2ff] drop-shadow-[0_0_15px_rgba(0,242,255,0.4)] animate-pulse">
                      {formatMXN(totalNeto)}
                   </div>
                </div>
             </div>
          </div>
          
          <div className="bg-[#0d1524] border border-blue-500/10 p-8 rounded-[2.5rem] flex flex-col justify-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Transacciones</p>
             <div className="text-4xl font-space-grotesk font-black text-white">
                {txs.length} <span className="text-xs font-light text-gray-600 uppercase tracking-widest">Movimientos</span>
             </div>
             <p className="text-[9px] text-gray-600 mt-2 italic">* Datos sincronizados en tiempo real con Stripe</p>
          </div>
       </div>

       {/* FILTROS */}
       <div className="flex flex-col md:flex-row gap-4 bg-[#0d1524]/50 border border-blue-500/10 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex-1">
             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Filtrar por Tipo de Operación</label>
             <select 
               className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-cyan-500 text-white"
               onChange={e => setTypeFilter(e.target.value)}
               value={typeFilter}
             >
                <option value="">TODOS LOS MOVIMIENTOS</option>
                <option value="COURSE_PURCHASE">COMPRAS DE CURSOS</option>
                <option value="INSTRUCTOR_SUBSCRIPTION">RENTAS DE INSTRUCTORES</option>
             </select>
          </div>

          <div className="flex-1">
             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Estado de Liquidación</label>
             <select 
               className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-green-500 text-white"
               onChange={e => setStatusFilter(e.target.value)}
               value={statusFilter}
             >
                <option value="">TODOS LOS ESTADOS</option>
                <option value="SUCCESS">PAGOS EXITOSOS</option>
                <option value="PENDING">PENDIENTES</option>
                <option value="FAILED">FALLIDOS / CANCELADOS</option>
             </select>
          </div>
       </div>

       {/* TABLA DE TRANSACCIONES */}
       <div className="bg-[#0d1524] border border-blue-500/10 rounded-3xl shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead className="bg-[#152035]/50 border-b border-blue-500/10">
                <tr>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Fecha / ID</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Usuario</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Detalle</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Montos (MXN)</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Estado</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-blue-500/5">
                {loading ? (
                   <tr>
                      <td colSpan={5} className="p-20 text-center text-gray-500 animate-pulse text-xs uppercase tracking-widest font-black italic">Consultando libros contables...</td>
                   </tr>
                ) : txs.map(tx => (
                   <tr key={tx.id} className="hover:bg-blue-600/5 transition-colors group">
                      <td className="p-6">
                         <p className="text-xs font-bold text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                         <p className="text-[10px] text-gray-600 font-mono mt-0.5 truncate w-32">{tx.id}</p>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs">
                               {tx.user.name[0]}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-200 leading-none">{tx.user.name} {tx.user.lastName}</p>
                               <div className="flex items-center gap-2 mt-1.5 font-black uppercase tracking-widest text-[8px]">
                                  <span className={`px-2 py-0.5 rounded border ${
                                     tx.user.role === 'ADMIN' ? 'text-purple-400 bg-purple-400/5 border-purple-400/20' :
                                     tx.user.role === 'INSTRUCTOR' ? 'text-cyan-400 bg-cyan-400/5 border-cyan-400/20' :
                                     'text-blue-400 bg-blue-400/5 border-blue-400/20'
                                  }`}>
                                     {tx.user.role}
                                  </span>
                                  <span className="text-gray-600 font-mono italic normal-case tracking-normal">{tx.user.email}</span>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-black uppercase text-cyan-400 tracking-tighter">
                                {tx.paymentType === 'COURSE_PURCHASE' ? '📥 INSCRIPCIÓN / VENTA' : '💎 RENTA / SUSCRIPCIÓN'}
                             </span>
                             <p className="text-xs text-gray-300 font-medium truncate w-40">
                                {tx.paymentType === 'COURSE_PURCHASE' 
                                   ? `Inscripción: ${tx.course?.title || 'No especificado'}` 
                                   : `💎 Renta Mensual - ${tx.user.instructorProfile?.subscriptions[0]?.plan?.displayName || 'Instructor'}`}
                             </p>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="space-y-1">
                            <p className="text-sm font-bold text-white">{formatMXN(tx.grossAmount)}</p>
                            <div className="flex gap-2 text-[9px] font-bold uppercase tracking-widest">
                               <span className="text-blue-400">PLAT: {formatMXN(tx.platformCommissionAmount)}</span>
                               <span className="text-gray-500">|</span>
                               <span className="text-green-400">INST: {formatMXN(tx.netAmountToInstructor)}</span>
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border animate-pulse ${
                            tx.paymentStatus === 'SUCCESS' ? 'text-green-400 bg-green-400/5 border-green-400/20' : 
                            tx.paymentStatus === 'PENDING' ? 'text-yellow-400 bg-yellow-400/5 border-yellow-400/20' : 
                            'text-red-400 bg-red-400/5 border-red-400/20'
                         }`}>
                           {tx.paymentStatus}
                         </span>
                      </td>
                   </tr>
                ))}
                {(!loading && txs.length === 0) && (
                   <tr>
                      <td colSpan={5} className="p-20 text-center text-gray-500 italic">No hay transacciones registradas.</td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
