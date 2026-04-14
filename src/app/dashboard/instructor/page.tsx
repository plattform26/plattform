import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CourseActionsClient from '@/components/dashboard/CourseActionsClient';
import StarRating from '@/components/StarRating';
import NewCourseButton from '@/components/dashboard/NewCourseButton';

export default async function InstructorDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
        take: 1,
      },
    },
  });

  if (!profile) return <div>Perfil no encontrado</div>;

  const activeSub = profile.subscriptions[0];
  const isCourtesy = profile.user.isCourtesy;
  
  // Misión: Lógica de Plan (Cortesía vs Stripe)
  const courtesyPlan = isCourtesy && profile.user.courtesyPlanId 
    ? await prisma.platformPlan.findUnique({ where: { id: profile.user.courtesyPlanId } })
    : null;

  const currentPlan = activeSub?.plan || courtesyPlan;
  const planDisplayName = currentPlan?.displayName || 'Ninguno';
  const studentLimit = currentPlan?.studentLimit ?? 0;
  
  // Total Enrollments (Alumnos-Materia)
  const totalEnrollmentsCount = await prisma.enrollment.count({
    where: { course: { instructorId: session.userId } }
  });

  const isUnlimited = studentLimit === -1;
  const usagePercent = isUnlimited ? 0 : (totalEnrollmentsCount / studentLimit) * 100;
  
  // LOGICA DE BANNERS (Universal Policy)
  const isHibernated = await prisma.course.count({
    where: { instructorId: session.userId, status: 'HIBERNATED' }
  }) > 0;
  
  const daysUntilExpiry = activeSub?.expiresAt 
    ? Math.ceil((new Date(activeSub.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // STATS
  const totalCourses = await prisma.course.count({
    where: { instructorId: session.userId, status: 'PUBLISHED' }
  });

  // Unique Students (Total Alumnos)
  const studentsCountRaw = await prisma.$queryRaw<any[]>`
    SELECT COUNT(DISTINCT user_id) as "total" FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE c.instructor_id = ${session.userId} 
  `;
  const studentsCount = Number(studentsCountRaw[0]?.total || 0);

  // Global Rating Stats
  const instructorRatings = await prisma.courseRating.aggregate({
    where: { instructorId: session.userId },
    _avg: { rating: true },
    _count: { id: true }
  });
  
  const avgRating = instructorRatings._avg.rating || 0;
  const ratingCount = instructorRatings._count.id;

  // Fetch individual course ratings for the list
  const courseAggregatedRatings = await prisma.courseRating.groupBy({
    by: ['courseId'],
    where: { instructorId: session.userId },
    _avg: { rating: true },
    _count: { id: true }
  });

  // Monthly Earnings
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyEnrollments = await prisma.enrollment.findMany({
    where: {
      course: { instructorId: session.userId },
      createdAt: { gte: startOfMonth }
    },
    include: { course: true }
  });

  const monthlyEarnings = monthlyEnrollments.reduce((acc, curr) => acc + Number(curr.course.price || 0), 0);

  // Recent courses
  const recentCourses = await prisma.course.findMany({
    where: { instructorId: session.userId, deletedAt: null },
    include: {
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-space-grotesk font-bold">Bienvenido, {profile.user.name} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Aquí está el estado de tu academia hoy.</p>
      </div>

      {/* BANNER CRITICO: HIBERNACION (Bypassed if Courtesy) */}
      {isHibernated && !isCourtesy && (
        <div className="mb-6 p-5 bg-red-600/20 border border-red-500/50 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
           <div className="flex items-center gap-4">
              <span className="text-4xl">❄️</span>
              <div>
                 <h2 className="text-lg font-black text-white uppercase tracking-tighter">Academia en Hibernación</h2>
                 <p className="text-sm text-red-100/80">Tus cursos son invisibles y el acceso a la IA ha sido bloqueado por falta de pago o exceso de cupo.</p>
              </div>
           </div>
           <Link href="/dashboard/instructor/plan" className="px-6 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-red-500/20 uppercase tracking-widest">Regularizar Suscripción</Link>
        </div>
      )}

      {/* ALERTA PREVENTIVA: VENCIMIENTO (Bypassed if Courtesy) */}
      {!isHibernated && !isCourtesy && daysUntilExpiry !== null && daysUntilExpiry <= 5 && daysUntilExpiry >= 0 && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                 <p className="text-sm font-bold text-orange-200">Tu plan vence en {daysUntilExpiry} {daysUntilExpiry === 1 ? 'día' : 'días'}.</p>
                 <p className="text-xs text-orange-200/60">Asegúrate de renovar para evitar la hibernación automática de tus cursos.</p>
              </div>
           </div>
           <Link href="/dashboard/instructor/plan" className="text-xs font-bold text-orange-300 hover:text-orange-200 underline">Gestionar renovación →</Link>
        </div>
      )}

      {/* ALERTAS DE CAPACIDAD (Bypassed if Courtesy) */}
      {!isUnlimited && !isCourtesy && usagePercent >= 80 && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-4 ${
          usagePercent >= 100 ? 'bg-red-500/10 border-red-500/50 text-red-100' :
          'bg-yellow-500/10 border-yellow-500/30 text-yellow-100'
        }`}>
          <div className="flex items-center gap-3">
             <span className="text-2xl">{usagePercent >= 100 ? '🚫' : '⚠️'}</span>
             <div>
                <p className="text-sm font-bold">Límite de capacidad {usagePercent >= 100 ? 'excedido' : 'próximo'}</p>
                <p className="text-xs opacity-70 mt-0.5">
                   Has usado {totalEnrollmentsCount}/{studentLimit} inscripciones. 
                   {usagePercent >= 100 ? ' Tus cursos han sido hibernados.' : ' Sube de plan para evitar cierres.'}
                </p>
             </div>
          </div>
          <Link href="/dashboard/instructor/plan" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">Upgrade →</Link>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#06B6D4]/10 to-[#3B82F6]/10 border border-[#06B6D4]/30 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 mb-8">
         <span className="text-4xl shadow-cyan-500/50 drop-shadow-lg">💎</span>
         <div className="flex-1">
           <div className={`text-sm font-semibold ${isCourtesy ? 'text-yellow-400' : 'text-cyan-400'}`}>
             Plan {planDisplayName} 
             {isCourtesy && <span className="ml-2 text-[10px] bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 italic">Cortesía ADM</span>}
             {!isCourtesy && activeSub && ` — ${activeSub.status}`}
           </div>
           <p className="text-xs text-gray-400 mt-1">Límite de alumnos-materia: <strong className="text-white">{studentLimit === -1 ? 'Ilimitado' : `${totalEnrollmentsCount}/${studentLimit}`}</strong></p>
         </div>
         <Link href="/dashboard/instructor/plan" className="px-5 py-2 rounded-lg border border-blue-500/20 text-xs font-semibold text-gray-300 hover:text-white hover:border-cyan-500 transition-colors">Modificar plan →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#152035] border border-blue-500/20 rounded-2xl p-5 hover:border-blue-500/40 hover:-translate-y-1 transition-all">
          <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">📚 Cursos activos</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{totalCourses}</div>
        </div>
        <div className="bg-[#152035] border border-blue-500/20 rounded-2xl p-5 hover:border-blue-500/40 hover:-translate-y-1 transition-all">
          <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">👥 Total alumnos</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{studentsCount}</div>
        </div>
        <div className="bg-[#152035] border border-blue-500/20 rounded-2xl p-5 hover:border-blue-500/40 hover:-translate-y-1 transition-all">
          <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">💰 Ingresos (mes)</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monthlyEarnings)}
          </div>
        </div>
        <div className="bg-[#152035] border border-blue-500/20 rounded-2xl p-5 hover:border-blue-500/40 hover:-translate-y-1 transition-all">
          <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">⭐ Calificación Global</div>
          <div className="mt-1">
            {ratingCount > 0 ? (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-yellow-500 bg-clip-text text-transparent">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating value={avgRating} readonly size="sm" />
                  <span className="text-[10px] text-gray-500 font-bold">({ratingCount})</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col">
                <div className="text-xl font-bold text-gray-600">N/A</div>
                <span className="text-[10px] text-gray-500 italic">Sin evaluaciones aún</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#152035] border border-blue-500/20 rounded-2xl mb-10">
        <div className="p-5 border-b border-blue-500/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Cursos Recientes</h3>
          <NewCourseButton status={profile.user.status} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-blue-500/5 border-b border-blue-500/10">
              <tr>
                <th className="font-semibold text-gray-400 px-6 py-4 uppercase text-[11px] tracking-wider">Curso</th>
                <th className="font-semibold text-gray-400 px-6 py-4 uppercase text-[11px] tracking-wider">Alumnos</th>
                <th className="font-semibold text-gray-400 px-6 py-4 uppercase text-[11px] tracking-wider">Estado</th>
                <th className="font-semibold text-gray-400 px-6 py-4 uppercase text-[11px] tracking-wider">Reputación</th>
                <th className="font-semibold text-gray-400 px-6 py-4 uppercase text-[11px] tracking-wider">Precio</th>
                <th className="font-semibold text-gray-400 px-6 py-4 uppercase text-[11px] tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentCourses.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">Empieza creando tu primer curso.</td></tr>
              ) : recentCourses.map(c => (
                <tr key={c.id} className="border-b border-blue-500/5 hover:bg-blue-500/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{c.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-bold">{c._count.enrollments}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">INSCRITOS</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'PUBLISHED' ? <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-[11px] font-bold">● PUBLICADO</span> :
                     c.status === 'DRAFT' ? <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded text-[11px] font-bold">● BORRADOR</span> :
                     <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-[11px] font-bold">● HIBERNADO</span>}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const rating = courseAggregatedRatings.find(r => r.courseId === c.id);
                      const avg = rating?._avg.rating || 0;
                      const count = rating?._count.id || 0;
                      if (count === 0) return <span className="text-gray-600 text-[10px] italic">Sin evaluaciones</span>;
                      return (
                        <div className="flex flex-col items-start gap-1">
                          <StarRating value={avg} readonly size="sm" />
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{count} evaluaciones</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-cyan-400 font-semibold">${Number(c.price)} MXN</td>
                  <td className="px-6 py-4 text-right">
                    <CourseActionsClient 
                      courseId={c.id} 
                      status={c.status} 
                      enrollmentCount={c._count.enrollments} 
                      role="INSTRUCTOR" 
                      planName={activeSub?.plan.name}
                      instructorStatus={profile.user.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
