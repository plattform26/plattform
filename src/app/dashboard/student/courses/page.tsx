import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StudentCourseRatingOrchestrator from '@/components/dashboard/StudentCourseRatingOrchestrator';
import ManualRatingButton from '@/components/dashboard/ManualRatingButton';

export default async function StudentCoursesPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  // Si el usuario está autenticado pero no es un estudiante (ej: Admin o Instructor),
  // enviarlo al enrutador inteligente de /dashboard en lugar de expulsarlo al login.
  if (session.role !== 'STUDENT') redirect('/dashboard');


  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId, status: 'ACTIVE' },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          _count: { select: { lessons: true } },
          quizAttempts: { where: { userId: session.userId, passed: true } }
        }
      }
    },
    orderBy: { enrolledAt: 'desc' }
  });

  const coursesArr = await Promise.all(enrollments.map(async (en: any) => {
    const completedLessons = await prisma.progress.count({
      where: { userId: session.userId, courseId: en.courseId, completed: true }
    });
    const totalLessons = en.course._count.lessons;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Certificado
    const certification = await prisma.certification.findFirst({
        where: { userId: session.userId, courseId: en.courseId }
    });

    const userRatingRecord = await prisma.courseRating.findFirst({
      where: { courseId: en.courseId, userId: session.userId },
      select: { rating: true }
    });

    const hasPassedQuiz = (en.course.quizAttempts?.length || 0) > 0;

    return { 
      id: en.course.id,
      title: en.course.title,
      thumbnailUrl: en.course.thumbnailUrl,
      progress, 
      hasCertificate: !!certification,
      hasPassedQuiz,
      userRating: userRatingRecord?.rating || null,
      instructorName: en.course.instructor?.name || 'Instructor' 
    };
  }));

  const totalCompletedCourses = coursesArr.filter(c => c.progress === 100 || c.hasPassedQuiz || c.hasCertificate).length;
  const totalCertificates = coursesArr.filter(c => c.hasCertificate).length;

  return (
    <div className="space-y-10">
      {/* ORQUESTADOR DE RATING RETROACTIVO */}
      <StudentCourseRatingOrchestrator courses={coursesArr} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-space-grotesk font-black text-white italic uppercase tracking-tighter italic">Laboratorio de <span className="text-cyan-400">Aprendizaje</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Ecosistema personal de crecimiento y certificaciones</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-[#152035] border border-blue-500/10 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-xl">🏆</div>
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Completados</p>
                 <p className="text-lg font-black text-cyan-400 font-mono">{totalCompletedCourses}</p>
              </div>
           </div>
           <div className="bg-[#152035] border border-blue-500/10 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-xl">🎓</div>
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Certificados</p>
                 <p className="text-lg font-black text-green-400 font-mono">{totalCertificates}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {coursesArr.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#152035] rounded-3xl border border-blue-500/10">
             <div className="text-4xl mb-4">🎒</div>
             <p className="text-gray-400 italic">No tienes cursos todavía.</p>
             <Link href="/courses" className="mt-4 text-cyan-400 block text-sm">Explorar catálogo</Link>
          </div>
        ) : (
          coursesArr.map((course) => (
            <div key={course.id} className="bg-[#152035] border border-blue-500/15 rounded-3xl overflow-hidden hover:-translate-y-1 transition-all group shadow-lg">
                <div className="aspect-video relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-blue-900/30 flex items-center justify-center text-3xl">📚</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#152035] via-transparent to-transparent"></div>
                </div>
                <div className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <Link href={`/dashboard/student/learn/${course.id}`} className="flex-1">
                            <h3 className="font-bold text-sm group-hover:text-cyan-400 transition-colors line-clamp-2 italic">{course.title}</h3>
                        </Link>
                        {course.hasCertificate && (
                            <span className="text-[8px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-black animate-pulse whitespace-nowrap shadow-[0_0_100px_rgba(34,197,94,0.2)]">
                                ✅ CERTIFICADO
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-1 flex-1 bg-[#0d1524] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000"
                                style={{ width: `${course.progress}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-black text-cyan-400 font-mono">{course.progress}%</span>
                    </div>

                    <p className="text-[9px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Instruido por</p>
                    <p className="text-[10px] text-gray-300 mb-2 font-black uppercase italic">{course.instructorName}</p>
                    
                    {/* BOTÓN DE RATING RETROACTIVO/MANUAL */}
                    {course.progress === 100 && (
                      <ManualRatingButton courseId={course.id} userRating={course.userRating} />
                    )}
                    
                    <div className="mt-4">
                        <Link 
                           href={`/dashboard/student/learn/${course.id}`}
                           className="block w-full py-3 bg-blue-600 hover:bg-cyan-500 hover:text-black rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                        >
                           Ver Contenido →
                        </Link>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
