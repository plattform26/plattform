import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatMXN } from '@/lib/utils/currency';

export default async function StudentPurchasesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, lastName: true } },
          certifications: { where: { userId: session.userId } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in font-poppins pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">
           Gestión de <span className="text-cyan-400">Mis Finanzas</span>
        </h1>
        <p className="text-gray-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em] italic">Historial completo de inversiones y accesos de seguridad.</p>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0b0e14]/50 border-b border-[#30363d]">
              <tr>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Producto / Curso</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Instructor</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Inversión</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Fecha</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Estado</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center text-gray-700 italic uppercase tracking-[0.3em] text-[10px]">No se encontraron inscripciones en tu cuenta.</td>
                </tr>
              ) : enrollments.map(en => {
                return (
                  <tr key={en.id} className="hover:bg-cyan-400/5 transition-all group">
                    <td className="p-6">
                      <Link href={`/dashboard/student/learn/${en.courseId}`} className="font-bold text-gray-400 group-hover:text-cyan-400 transition-colors uppercase text-sm tracking-tight block mb-1">
                        {en.course?.title || 'Curso de Plataforma'}
                      </Link>
                      <span className="text-[8px] text-gray-600 font-mono tracking-widest">EN-ID: {en.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="p-6">
                      <p className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest">
                        {en.course?.instructor ? `${en.course.instructor.name} ${en.course.instructor.lastName}` : 'Administración'}
                      </p>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-xs font-black text-white bg-white/5 px-4 py-2 border border-white/5 rounded-xl group-hover:border-cyan-500/20 transition-all">
                        {formatMXN(en.course?.price)}
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                        {new Date(en.createdAt).toLocaleDateString('es-MX', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        }).replace(/\//g, '/')}
                      </p>
                    </td>
                    <td className="p-6 text-center">
                       {(() => {
                         const hasCertificate = en.course?.certifications && en.course.certifications.length > 0;
                         
                         if (hasCertificate) {
                           return (
                             <span className="text-[8px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-black uppercase shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                COMPLETADO
                             </span>
                           );
                         }
                         
                         return (
                           <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-black uppercase">
                              ACTIVO
                           </span>
                         );
                       })()}
                    </td>
                    <td className="p-6 text-right">
                      <Link href={`/dashboard/student/learn/${en.courseId}`} className="px-6 py-2 bg-purple-600/10 border border-purple-500/20 rounded-xl text-[9px] font-black text-purple-400 hover:bg-purple-600/20 transition-all uppercase tracking-widest">
                        Ingresar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
