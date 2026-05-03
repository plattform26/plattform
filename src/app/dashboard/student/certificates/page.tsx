import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CertificateDownloader from '@/components/CertificateDownloader';

export default async function StudentCertificatesPage() {
  const session = await getSession();
  if (!session || (session.role !== 'STUDENT' && session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  // Misión: Mostrar LOGROS reales (Certificaciones)
  const certifications = await prisma.certification.findMany({
    where: { userId: session.userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, lastName: true } }
        }
      },
      quizAttempt: true // Relación directa más eficiente
    },
    orderBy: { issuedAt: 'desc' }
  });

  const studentFullName = `${session.name} ${session.lastName || ''}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold">Mis <span className="text-cyan-400">logros</span> 🎓</h1>
        <p className="text-gray-400 text-sm mt-1">Aquí encontrarás los cursos aprobados y tus certificados oficiales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#152035] rounded-3xl border border-blue-500/10">
             <div className="text-4xl mb-4">🏆</div>
             <p className="text-gray-400 italic">Termina un curso para ver tus logros aquí.</p>
          </div>
        ) : (
          certifications.map((cert: any) => {
            const score = cert.quizAttempt ? cert.quizAttempt.scorePercentage : 100;
            const date = cert.issuedAt || cert.createdAt;

            return (
              <div key={cert.id} className="bg-[#152035] border border-blue-500/15 rounded-3xl p-6 hover:-translate-y-1 transition-all group shadow-lg flex flex-col">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#1a2f55] to-[#0a1f44] rounded-xl mb-6 flex items-center justify-center border border-blue-500/10 relative overflow-hidden text-center p-4">
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
                     <div className="relative z-10">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-500">📜</div>
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{score}% DE ACIERTOS</p>
                     </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1">{cert.course.title}</h3>
                  <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest">
                     Por {cert.course.instructor.name} {cert.course.instructor.lastName}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-blue-500/10 flex items-center justify-between">
                     <div className="text-[10px] font-mono text-gray-500 italic">
                        {new Date(date).toLocaleDateString()}
                     </div>
                     <CertificateDownloader 
                        studentName={studentFullName}
                        courseTitle={cert.course.title}
                        certificateCode={cert.certificateCode || `PLT-SYNC-${cert.id.substring(0,6)}`}
                        variant="outline"
                        buttonText="Descargar (PDF)"
                        finalScore={score / 10}
                     />
                  </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
