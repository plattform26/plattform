import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function InstructorEarningsPage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const transactions = await prisma.transaction.findMany({
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

  const grossEarnings = transactions.reduce((acc: number, t: any) => acc + Number(t.grossAmount), 0);
  const totalCommission = transactions.reduce((acc: number, t: any) => acc + Number(t.platformCommissionAmount), 0);
  const netEarnings = transactions.reduce((acc: number, t: any) => acc + Number(t.netAmountToInstructor), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyNetEarnings = transactions
    .filter((t: any) => {
      const d = new Date(t.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc: number, t: any) => acc + Number(t.netAmountToInstructor), 0);

  // Datos para la gráfica (últimos 6 meses)
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
     const date = new Date();
     date.setMonth(date.getMonth() - (5 - i));
     const monthName = date.toLocaleString('es-MX', { month: 'short' }).toUpperCase();
     const monthNum = date.getMonth();
     const yearNum = date.getFullYear();

     const monthTotal = transactions
       .filter((t: any) => {
         const tDate = new Date(t.createdAt);
         return tDate.getMonth() === monthNum && tDate.getFullYear() === yearNum;
       })
       .reduce((acc: number, t: any) => acc + Number(t.grossAmount), 0);

     return { name: monthName, total: monthTotal };
  });

  const maxMonthValue = Math.max(...monthlyData.map(d => d.total), 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold">Resumen de <span className="text-cyan-400">ingresos</span></h1>
        <p className="text-gray-400 text-sm mt-1">Monitorea tus ventas y el rendimiento de tu academia.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Ingresos Brutos</div>
          <div className="text-3xl font-extrabold text-white">${grossEarnings.toLocaleString('es-MX')}</div>
          <div className="text-[10px] text-gray-500 mt-1">Total histórico antes de comisiones</div>
        </div>
        <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Comisión Plattform</div>
          <div className="text-3xl font-extrabold text-red-400/80">-${totalCommission.toLocaleString('es-MX')}</div>
          <div className="text-[10px] text-gray-500 mt-1">Monto retenido por infraestructura</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a2f55] to-[#0a1f44] border border-cyan-500/30 p-6 rounded-2xl shadow-lg shadow-cyan-500/5">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">💰 Ingresos (Mes Actual)</div>
          <div className="text-3xl font-extrabold text-cyan-400">MXN ${monthlyNetEarnings.toLocaleString('es-MX')}</div>
          <div className="text-[10px] text-gray-400 mt-1">Utilidad neta generada este mes</div>
        </div>
      </div>

      {/* GRÁFICA NATIVA */}
      <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl p-8">
        <h3 className="text-lg font-bold mb-8">Tendencia de ingresos (6 meses)</h3>
        <div className="h-64 flex items-end justify-between gap-4">
           {monthlyData.map((data, i) => {
             const heightPercent = (data.total / maxMonthValue) * 100;
             return (
               <div key={i} className="flex-1 flex flex-col items-center group">
                 <div className="relative w-full flex justify-center">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 bg-cyan-500 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      ${data.total.toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                 </div>
                 <div className="text-[10px] font-bold text-gray-500 mt-4 uppercase">{data.name}</div>
               </div>
             );
           })}
        </div>
      </div>

      {/* TABLA DE TRANSACCIONES */}
      <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-500/10 flex justify-between items-center">
           <h3 className="font-bold">Historial de Ventas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#152035] text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Alumno</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Bruto</th>
                <th className="px-6 py-4">Comisión</th>
                <th className="px-6 py-4">Neto</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/5">
              {transactions.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-6 py-20 text-center text-gray-500 italic">No hay ventas registradas todavía.</td>
                </tr>
              ) : (
                transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(t.createdAt).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{t.user.name} {t.user.lastName}</div>
                      <div className="text-[10px] text-gray-500">{t.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-300">
                      {t.course?.title}
                    </td>
                    <td className="px-6 py-4 font-bold">${Number(t.grossAmount).toFixed(0)}</td>
                    <td className="px-6 py-4 text-red-400/60">-${Number(t.platformCommissionAmount).toFixed(0)}</td>
                    <td className="px-6 py-4 text-cyan-400 font-bold">${Number(t.netAmountToInstructor).toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-500/10 text-green-500 text-[10px] font-extrabold px-2 py-1 rounded-full border border-green-500/20 uppercase">Éxito</span>
                    </td>
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
