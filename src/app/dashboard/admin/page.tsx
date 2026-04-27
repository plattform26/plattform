import prisma from '@/lib/prisma';
import { formatMXN } from '@/lib/utils/currency';

export default async function AdminDashboardSummaryPage() {
  // Obtener KPIs en servidores para el renderizado inicial veloz
  const [userCount, instructorCount, courseCount, transactionCount] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'INSTRUCTOR', status: 'ACTIVE' } }),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.transaction.count({ where: { paymentStatus: 'SUCCESS' } }),
  ]);

  // Rentas y Comisiones del mes actual (agregación simple)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyRevenue = await prisma.transaction.aggregate({
    where: { 
        paymentStatus: 'SUCCESS',
        createdAt: { gte: firstDayOfMonth }
    },
    _sum: {
        platformCommissionAmount: true,
        grossAmount: true // To sum subscription rents if they are course purchases or separate
    }
  });

  // Query for Instructor Rents specifically (INSTRUCTOR_SUBSCRIPTION)
  const instructorRents = await prisma.transaction.aggregate({
    where: {
        paymentType: 'INSTRUCTOR_SUBSCRIPTION',
        paymentStatus: 'SUCCESS',
        createdAt: { gte: firstDayOfMonth }
    },
    _sum: { grossAmount: true }
  });

  const totalPlatformIncome = Number(monthlyRevenue._sum.platformCommissionAmount || 0) + Number(instructorRents._sum.grossAmount || 0);

  // Top Instructores (Agregación por ingresos acumulados en transacciones)
  // Top Instructores (Renta + Volumen de Ventas)
  const topInstructors = await prisma.transaction.groupBy({
    by: ['instructorId'],
    where: { paymentStatus: 'SUCCESS', instructorId: { not: null } },
    _sum: { grossAmount: true },
    orderBy: { _sum: { grossAmount: 'desc' } },
    take: 5
  });

  // Alertas Críticas (Dinamizadas)
  const [failedPaymentsCount, expiringSubsCount, emptyCoursesCount] = await Promise.all([
     prisma.transaction.count({ where: { paymentStatus: 'FAILED', createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } } }),
     prisma.instructorSubscription.count({ 
        where: { 
            status: 'ACTIVE', 
            expiresAt: { 
                lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 
                gte: new Date()
            } 
        } 
     }),
     prisma.course.count({ where: { lessons: { none: {} }, deletedAt: null } })
  ]);

  // Obtener nombres de los instructores
  const instructorIds = topInstructors.map((ti: any) => ti.instructorId as string);
  const instructorNames = await prisma.user.findMany({
    where: { id: { in: instructorIds } },
    select: { id: true, name: true, lastName: true }
  });

  const formattedTopInstructors = topInstructors.map((ti: any) => {
     const user = instructorNames.find((u: any) => u.id === ti.instructorId);
      return {
         name: user ? `${user.name} ${user.lastName}` : 'Desconocido',
         total: Number(ti._sum.grossAmount || 0)
      }
  });

  return (
    <div className="space-y-10">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-space-grotesk font-bold">Resumen de <span className="text-cyan-400">Plataforma</span></h1>
             <p className="text-gray-400 mt-2 font-light tracking-wide">Estado global de tu ecosistema SaaS.</p>
          </div>
          
       </div>

       {/* KPIs GRID */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0d1524] border border-blue-500/10 p-8 rounded-3xl group hover:border-blue-500/30 transition-all">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Usuarios Totales</div>
             <div className="flex items-end justify-between">
                <div className="text-4xl font-extrabold">{userCount}</div>
                <div className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">↑ 12%</div>
             </div>
          </div>
          <div className="bg-[#0d1524] border border-blue-500/10 p-8 rounded-3xl group hover:border-blue-500/30 transition-all">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Instructores Activos</div>
             <div className="flex items-end justify-between">
                <div className="text-4xl font-extrabold">{instructorCount}</div>
                <div className="text-xs text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded">ESTABLE</div>
             </div>
          </div>
          <div className="bg-[#0d1524] border border-blue-500/10 p-8 rounded-3xl group hover:border-blue-500/30 transition-all">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Cursos Publicados</div>
             <div className="flex items-end justify-between">
                <div className="text-4xl font-extrabold text-cyan-400">{courseCount}</div>
                <div className="text-xs text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded">↑ 5</div>
             </div>
          </div>
          <div className="bg-gradient-to-br from-[#1a2f55] to-[#0a1f44] border border-cyan-500/20 p-8 rounded-3xl shadow-[0_10px_30px_rgba(6,182,212,0.1)]">
             <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Ingresos Plattform (Mes)</div>
             <div className="flex items-end justify-between">
                 <div className="text-4xl font-extrabold text-white">{formatMXN(totalPlatformIncome)}</div>
                <div className="text-[10px] text-gray-400 uppercase">MXN</div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ALERTAS DEL SISTEMA */}
          <div className="lg:col-span-1 space-y-6">
             <h3 className="text-xl font-bold border-l-4 border-red-500 pl-4">Alertas Críticas 🚩</h3>
             <div className="space-y-3">
                <div className={`p-4 rounded-2xl flex gap-4 border ${failedPaymentsCount > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/10 opacity-40'}`}>
                   <span className="text-xl">{failedPaymentsCount > 0 ? '⚠️' : '✅'}</span>
                   <div>
                      <p className={`text-sm font-bold ${failedPaymentsCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{failedPaymentsCount} Pagos Fallidos</p>
                      <p className="text-xs text-gray-500 mt-1">En el registro de las últimas 48 horas.</p>
                   </div>
                </div>
                <div className={`p-4 rounded-2xl flex gap-4 border ${expiringSubsCount > 0 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-gray-500/5 border-gray-500/10 opacity-40'}`}>
                   <span className="text-xl">⏳</span>
                   <div>
                      <p className={`text-sm font-bold ${expiringSubsCount > 0 ? 'text-orange-400' : 'text-gray-400'}`}>{expiringSubsCount} Suscripciones por Vencer</p>
                      <p className="text-xs text-gray-500 mt-1">Próximos 10 días de facturación.</p>
                   </div>
                </div>
                <div className={`p-4 rounded-2xl flex gap-4 border ${emptyCoursesCount > 0 ? 'bg-blue-500/5 border-blue-500/20' : 'bg-gray-500/5 border-gray-500/10 opacity-40'}`}>
                   <span className="text-xl">📝</span>
                   <div>
                      <p className={`text-sm font-bold ${emptyCoursesCount > 0 ? 'text-blue-400' : 'text-gray-400'}`}>{emptyCoursesCount} Cursos sin Contenido</p>
                      <p className="text-xs text-gray-500 mt-1">Borradores o cascarones en el sistema.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* TOP INSTRUCTORES */}
          <div className="lg:col-span-2 space-y-6">
             <h3 className="text-xl font-bold border-l-4 border-cyan-500 pl-4">Top Instructores (Ingresos) 🏆</h3>
             <div className="bg-[#0d1524] border border-blue-500/10 p-8 rounded-3xl space-y-8">
                {formattedTopInstructors.map((ins: any, i: number) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                         <span className="font-bold text-white">{ins.name}</span>
                         <span className="text-cyan-400 font-bold">{formatMXN(ins.total)}</span>
                      </div>
                      <div className="h-2 w-full bg-blue-900/30 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000" 
                           style={{ width: `${(ins.total / (formattedTopInstructors[0]?.total || 1)) * 100}%` }}
                         ></div>
                      </div>
                   </div>
                ))}
                {formattedTopInstructors.length === 0 && (
                   <p className="text-center text-gray-500 italic py-10">Sin datos de ingresos registrados.</p>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
