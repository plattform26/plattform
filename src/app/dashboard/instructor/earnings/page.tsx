import { getSession } from '@/lib/auth';
import ExportEarningsButton from './ExportEarningsButton';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function InstructorEarningsPage(
  props: { 
    searchParams: Promise<{ month?: string, year?: string }> 
  }
) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const selectedMonth = searchParams.month ? parseInt(searchParams.month) : new Date().getMonth();
  const selectedYear = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();

  // 1. Obtener Perfil y Plan para Comisiones
  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
    include: { 
      subscriptions: { 
        where: { status: 'ACTIVE' },
        include: { plan: true }
      } 
    }
  });

  const activePlan = instructor?.subscriptions[0]?.plan;
  const platformCommRate = Number(activePlan?.commissionRate || 15);
  const monthlyRent = Number(activePlan?.monthlyPrice || 0);

  // 2. Obtener Transacciones
  const allTransactions = await prisma.transaction.findMany({
    where: { 
      instructorId: session.userId,
      paymentStatus: 'SUCCESS',
      paymentType: 'COURSE_PURCHASE'
    },
    include: {
      user: { select: { name: true, lastName: true, email: true } },
      course: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const calcStripeFee = (gross: number) => {
    if (gross <= 0) return 0;
    return Number(((gross * 0.034) + 3) * 1.16);
  };

  const processedTransactions = allTransactions.map(t => {
    const gross = Number(t.grossAmount);
    const stripeFee = calcStripeFee(gross);
    const platformFee = gross * (platformCommRate / 100);
    const net = gross - stripeFee - platformFee;
    
    return {
      ...t,
      gross,
      stripeFee,
      platformFee,
      net,
      platformCommRate,
      createdAt: new Date(t.createdAt)
    };
  });

  const filteredTransactions = processedTransactions.filter(t => 
    t.createdAt.getMonth() === selectedMonth && t.createdAt.getFullYear() === selectedYear
  );

  const totalGross = filteredTransactions.reduce((acc, t) => acc + t.gross, 0);
  const totalPlatformFee = filteredTransactions.reduce((acc, t) => acc + t.platformFee, 0);
  const totalStripeFee = filteredTransactions.reduce((acc, t) => acc + t.stripeFee, 0);
  const totalNet = totalGross - totalPlatformFee - totalStripeFee;

  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
     const date = new Date();
     date.setMonth(date.getMonth() - (5 - i));
     const monthName = date.toLocaleString('es-MX', { month: 'short' }).toUpperCase();
     const mNum = date.getMonth();
     const yNum = date.getFullYear();

     const mTotal = processedTransactions
       .filter(t => t.createdAt.getMonth() === mNum && t.createdAt.getFullYear() === yNum)
       .reduce((acc, t) => acc + t.gross, 0);

     return { name: monthName, total: mTotal };
  });

  const maxMonthValue = Math.max(...monthlyData.map(d => d.total), 100);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const years = [2024, 2025, 2026];

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-space-grotesk font-bold">Resumen de <span className="text-cyan-400">ingresos</span></h1>
            <p className="text-gray-400 text-sm mt-1">Monitorea tus ventas y el rendimiento de tu academia.</p>
          </div>
          
          <form className="flex items-center gap-2 bg-[#152035] p-2 rounded-xl border border-white/5 shadow-xl">
             <select 
               name="month" 
               defaultValue={selectedMonth}
               className="bg-transparent text-xs font-bold uppercase tracking-widest border-none focus:ring-0 cursor-pointer"
             >
               {months.map((m, i) => <option key={i} value={i} className="bg-[#0d1524]">{m}</option>)}
             </select>
             <select 
               name="year" 
               defaultValue={selectedYear}
               className="bg-transparent text-xs font-bold uppercase tracking-widest border-none focus:ring-0 cursor-pointer"
             >
               {years.map(y => <option key={y} value={y} className="bg-[#0d1524]">{y}</option>)}
             </select>
             <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Filtrar</button>
          </form>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Venta Bruta</div>
          <div className="text-3xl font-black text-white">${totalGross.toLocaleString('es-MX')}</div>
          <div className="text-[10px] text-gray-500 mt-2 font-medium italic">Total pagado por alumnos</div>
        </div>
        <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Fee Plattform ({platformCommRate}%)</div>
          <div className="text-3xl font-black text-white/40">${totalPlatformFee.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div className="text-[10px] text-gray-500 mt-2 font-medium italic">Costo de infraestructura y soporte</div>
        </div>
        <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Renta del Plan</div>
          <div className="text-3xl font-black text-white/40">${monthlyRent.toLocaleString('es-MX')}</div>
          <div className="text-[10px] text-gray-500 mt-2 font-medium italic">Costo fijo: {activePlan?.displayName}</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border border-cyan-500/40 p-6 rounded-2xl shadow-xl shadow-cyan-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">💰</div>
          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-3">Utilidad Neta</div>
          <div className="text-3xl font-black text-cyan-400">${totalNet.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div className="text-[10px] text-cyan-500/60 mt-2 font-bold italic">Neto real tras Stripe MX e IVA</div>
        </div>
      </div>

      <div className="bg-[#0d1524] border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
        <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-12 text-gray-400">Tendencia de ingresos (6 meses)</h3>
        <div className="h-64 flex items-end justify-between gap-4">
           {monthlyData.map((data, i) => {
             const heightPercent = (data.total / maxMonthValue) * 100;
             return (
               <div key={i} className="flex-1 flex flex-col items-center group">
                 <div className="relative w-full flex justify-center">
                    <div className="absolute -top-12 bg-white text-black text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-xl">
                      ${data.total.toLocaleString()} MXN
                    </div>
                    <div 
                      className="w-full max-w-[44px] bg-gradient-to-t from-blue-600 via-cyan-500 to-blue-400 rounded-t-xl transition-all duration-700 shadow-lg shadow-cyan-500/10 group-hover:brightness-125"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                 </div>
                 <div className="text-[10px] font-black text-gray-600 mt-6 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">{data.name}</div>
               </div>
             );
           })}
        </div>
      </div>

      <div className="bg-[#0d1524] border border-blue-500/20 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-blue-500/10 flex justify-between items-center bg-[#152035]/30">
           <h3 className="font-space-grotesk font-black uppercase tracking-widest text-sm italic">Desglose de Operaciones</h3>
           <ExportEarningsButton data={filteredTransactions} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#152035] text-gray-500 uppercase text-[9px] font-black tracking-[0.3em]">
              <tr>
                <th className="px-8 py-5">Fecha</th>
                <th className="px-8 py-5">Alumno / Curso</th>
                <th className="px-8 py-5 text-right">Precio Org.</th>
                <th className="px-8 py-5 text-center">% Platf.</th>
                <th className="px-8 py-5 text-right">Fee Platf.</th>
                <th className="px-8 py-5 text-right">Fee Stripe (MX)</th>
                <th className="px-8 py-5 text-right text-cyan-400">Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-8 py-32 text-center text-gray-600 italic font-medium">No se han encontrado registros para el periodo seleccionado.</td>
                </tr>
              ) : (
                filteredTransactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-8 py-5 text-gray-500 font-bold uppercase tracking-tighter">
                      {t.createdAt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-white uppercase tracking-tight">{t.user.name} {t.user.lastName}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{t.course?.title}</div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-gray-400">${t.gross.toLocaleString('es-MX')}</td>
                    <td className="px-8 py-5 text-center">
                       <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-gray-500 font-black">{platformCommRate}%</span>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-red-500/40">-${t.platformFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 text-right font-bold text-gray-600">-${t.stripeFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 text-right font-black text-cyan-400 text-sm italic">${t.net.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
