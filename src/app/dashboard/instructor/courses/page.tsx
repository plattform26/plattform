import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serialize } from '@/lib/utils';
import { getEffectivePlan } from '@/lib/plan-utils';
import CourseActionsClient from '@/components/dashboard/CourseActionsClient';
import StarRating from '@/components/StarRating';
import NewCourseButton from '@/components/dashboard/NewCourseButton';
import { formatMXN } from '@/lib/utils/currency';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PUBLISHED: { label: 'PUBLICADO', cls: 'text-green-400 bg-green-400/10 border border-green-400/20' },
  DRAFT: { label: 'BORRADOR', cls: 'text-gray-400 bg-gray-400/10 border border-gray-400/20' },
  HIBERNATED: { label: 'OCULTO', cls: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' },
  ARCHIVED: { label: 'ARCHIVADO', cls: 'text-red-400 bg-red-400/10 border border-red-400/20' },
};

export default async function InstructorCoursesPage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const [plan, user] = await Promise.all([
    getEffectivePlan(session.userId),
    prisma.user.findUnique({ 
      where: { id: session.userId }, 
      select: { status: true, isCourtesy: true } 
    })
  ]);
  
  const planName = plan?.name || 'SIN PLAN';

  const courses = await prisma.course.findMany({
    where: { instructorId: session.userId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { enrollments: true, modules: true } },
    }
  });

  // Fetch individual course ratings
  const courseAggregatedRatings = await prisma.courseRating.groupBy({
    by: ['courseId'],
    where: { instructorId: session.userId },
    _avg: { rating: true },
    _count: { id: true }
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-space-grotesk font-bold text-white">Mis cursos 📚</h1>
          <p className="text-gray-400 text-sm mt-1">{courses.length} curso{courses.length !== 1 ? 's' : ''} creado{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <NewCourseButton 
           status={user?.status} 
           planName={planName} 
           isCourtesy={user?.isCourtesy} 
        />
      </div>

      <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-500/5 border-b border-blue-500/10">
              <tr>
                <th className="font-semibold text-gray-400 px-6 py-4 text-[11px] uppercase tracking-wider">Curso</th>
                <th className="font-semibold text-gray-400 px-6 py-4 text-[11px] uppercase tracking-wider">Estado</th>
                <th className="font-semibold text-gray-400 px-6 py-4 text-[11px] uppercase tracking-wider">Módulos</th>
                <th className="font-semibold text-gray-400 px-6 py-4 text-[11px] uppercase tracking-wider text-center">Alumnos</th>
                <th className="font-semibold text-gray-400 px-6 py-4 text-[11px] uppercase tracking-wider">Reputación</th>
                <th className="font-semibold text-gray-400 px-6 py-4 text-[11px] uppercase tracking-wider">Precio</th>
                <th className="font-semibold text-gray-400 px-6 py-4 text-[11px] uppercase tracking-wider text-right">Ciclo de Vida / Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <div className="text-gray-400 text-sm">No tienes cursos aún.</div>
                    <Link href="/dashboard/instructor/courses/new" className="text-cyan-400 text-sm hover:underline mt-1 inline-block">Crea tu primer curso →</Link>
                  </td>
                </tr>
              ) : courses.map(c => {
                const st = STATUS_MAP[c.status] ?? STATUS_MAP.DRAFT;
                return (
                  <tr key={c.id} className="border-b border-blue-500/5 hover:bg-blue-500/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{c.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{c.category} · {c.level}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${st.cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{c._count.modules}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-black ${c._count.enrollments > 0 ? 'text-cyan-400' : 'text-gray-500'}`}>
                          {c._count.enrollments}
                        </span>
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter mt-0.5">
                          / {plan?.studentLimit === -1 || !plan?.studentLimit ? '∞' : plan.studentLimit}
                        </span>
                      </div>
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
                    <td className="px-6 py-4 text-gray-300 font-semibold">{formatMXN(c.price)}</td>
                    <td className="px-6 py-4">
                      <CourseActionsClient 
                        courseId={c.id} 
                        status={c.status} 
                        enrollmentCount={c._count.enrollments} 
                        role="INSTRUCTOR" 
                        planName={serialize(planName)}
                        isCourtesy={user?.isCourtesy}
                        instructorStatus={user?.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
