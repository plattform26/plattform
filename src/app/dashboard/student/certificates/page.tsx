import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CertificateDownloader from '@/components/CertificateDownloader';

export default async function StudentCertificatesPage() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') redirect('/login');

  // Query based on passed QuizAttempts as requested
  const passedAttempts = await prisma.quizAttempt.findMany({
    where: { 
      userId: session.userId, 
      passed: true 
    },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, lastName: true } },
          certifications: {
            where: { userId: session.userId },
            take: 1
          }
        }
      },
      quiz: true
    },
    orderBy: { submittedAt: 'desc' },
    distinct: ['courseId'] // Only one entry per course
  });

  const studentFullName = `${session.name} ${session.lastName || ''}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold">Mis <span className="text-cyan-400">logros</span> 🎓</h1>
        <p className="text-gray-400 text-sm mt-1">Aquí encontrarás los cursos aprobados y tus certificados oficiales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {passedAttempts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#152035] rounded-3xl border border-blue-500/10">
             <div className="text-4xl mb-4">🏆</div>
             <p className="text-gray-400 italic">Termina un curso para ver tus logros aquí.</p>
          </div>
        ) : (
          passedAttempts.map((attempt: any) => (
            <div key={attempt.id} className="bg-[#152035] border border-blue-500/15 rounded-3xl p-6 hover:-translate-y-1 transition-all group shadow-lg flex flex-col">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#1a2f55] to-[#0a1f44] rounded-xl mb-6 flex items-center justify-center border border-blue-500/10 relative overflow-hidden text-center p-4">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
                   <div className="relative z-10">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-500">📜</div>
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{attempt.scorePercentage}% DE ACIERTOS</p>
                   </div>
                </div>
                
                <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1">{attempt.course.title}</h3>
                <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest">
                   Por {attempt.course.instructor.name} {attempt.course.instructor.lastName}
                </p>
                
                <div className="mt-auto pt-6 border-t border-blue-500/10 flex items-center justify-between">
                   <div className="text-[10px] font-mono text-gray-500 italic">
                      {new Date(attempt.submittedAt).toLocaleDateString()}
                   </div>
                   <CertificateDownloader 
                      studentName={studentFullName}
                      courseTitle={attempt.course.title}
                      certificateCode={attempt.course.certifications[0]?.certificateCode || `PLT-SYNC-${attempt.id.substring(0,6)}`}
                      variant="outline"
                      buttonText="Descargar (PDF)"
                      finalScore={attempt.scorePercentage / 10}
                   />
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
