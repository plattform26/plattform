import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StudentCourseRatingOrchestrator from '@/components/dashboard/StudentCourseRatingOrchestrator';
import ManualRatingButton from '@/components/dashboard/ManualRatingButton';

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session || (session.role !== 'STUDENT' && session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const userData = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!userData) redirect('/login');

  const enrolledCount = await prisma.enrollment.count({ where: { userId: session.userId, status: 'ACTIVE' } });
  const certCount = await prisma.certification.count({ where: { userId: session.userId } });

  // Obtener todas las inscripciones para calcular completitud real
  const allEnrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId, status: 'ACTIVE' },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          _count: { select: { lessons: true } },
          certifications: { where: { userId: session.userId } },
          quizAttempts: { where: { userId: session.userId, passed: true } }
        }
      }
    }
  });

  const enrollmentDetails = await Promise.all(allEnrollments.map(async (en: any) => {
    const completedLessons = await prisma.progress.count({
      where: { userId: session.userId, courseId: en.courseId, completed: true }
    });
    const totalLessons = en.course._count.lessons;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    const hasPassedQuiz = en.course.quizAttempts.length > 0;
    const hasCertificate = en.course.certifications.length > 0;
    const isCompleted = progress === 100 || hasPassedQuiz || hasCertificate;

    return { 
      ...en,
      course: {
          ...en.course,
          progress,
          isCompleted
      }
    };
  }));

  const completedCount = enrollmentDetails.filter(ed => ed.course.isCompleted).length;

  // Cursos recientes para "Continuar aprendiendo" (Los 3 más recientes no completados o actualizados recientemente)
  const recentCourses = await Promise.all(allEnrollments.slice(0, 3).map(async (en: any) => {
    const detail = enrollmentDetails.find(d => d.id === en.id);
    const progress = detail?.course.progress || 0;
    
    // Encontrar la última lección no completada
    const allLessonIds = (await prisma.courseLesson.findMany({
        where: { courseId: en.courseId },
        orderBy: { orderIndex: 'asc' },
        select: { id: true }
    })).map((l: any) => l.id);

    const completedLessonIds = (await prisma.progress.findMany({
        where: { userId: session.userId, courseId: en.courseId, completed: true },
        select: { lessonId: true }
    })).map((l: any) => l.lessonId);

    const nextLessonId = allLessonIds.find((id: string) => !completedLessonIds.includes(id)) || allLessonIds[0];

    const userRatingRecord = await prisma.courseRating.findFirst({
        where: { courseId: en.courseId, userId: session.userId },
        select: { rating: true }
    });

    return { 
      id: en.course.id,
      title: en.course.title,
      thumbnailUrl: en.course.thumbnailUrl,
      category: en.course.category,
      progress, 
      nextLessonId,
      hasCertificate: en.course.certifications.length > 0,
      userRating: userRatingRecord?.rating || null,
      hasRated: !!userRatingRecord?.rating,
      instructorName: en.course.instructor?.name || 'Instructor' 
    };
  }));

  return (
    <div className="space-y-10">
       {/* ORQUESTADOR DE RATING RETROACTIVO */}
       <StudentCourseRatingOrchestrator courses={recentCourses} />

       <div>
        <h1 className="text-3xl font-space-grotesk font-bold">¡Hola, {userData.name}! 👋</h1>
        <p className="text-gray-400 mt-2">Bienvenido de nuevo a tu academia personal.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cursos Inscritos</div>
            <div className="text-4xl font-extrabold">{enrolledCount}</div>
         </div>
         <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Completados</div>
            <div className="text-4xl font-extrabold text-green-400">{completedCount}</div>
         </div>
         <div className="bg-gradient-to-br from-[#1a2f55] to-[#0a1f44] border border-cyan-500/30 p-6 rounded-2xl">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Certificados</div>
            <div className="text-4xl font-extrabold text-cyan-400">{certCount}</div>
         </div>
      </div>

      {/* CONTINUAR APRENDIENDO */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-cyan-500 pl-4">Continuar <span className="text-cyan-400">aprendiendo</span></h2>
        
        {recentCourses.length === 0 ? (
          <div className="bg-[#0d1524] border border-blue-500/10 p-12 text-center rounded-2xl">
            <p className="text-gray-500 mb-6 italic">Aún no has empezado ningún curso.</p>
            <Link href="/courses" className="px-6 py-3 bg-blue-600 rounded-xl font-bold">Explorar cursos</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map(course => (
              <div 
                key={course.id} 
                className="bg-[#152035] border border-blue-500/20 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all flex flex-col group shadow-lg"
              >
                 <Link href={`/dashboard/student/learn/${course.id}`} className="block aspect-video bg-blue-900/30 relative">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                       <span className="text-xs font-bold bg-cyan-500 text-black px-2 py-0.5 rounded">{course.category}</span>
                    </div>
                 </Link>
                 <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1 gap-2">
                       <Link href={`/dashboard/student/learn/${course.id}`} className="block flex-1 group">
                          <h3 className="font-bold text-lg leading-tight group-hover:text-cyan-400 transition-colors">{course.title}</h3>
                       </Link>
                       {course.hasCertificate && (
                           <span className="text-[8px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-black animate-pulse whitespace-nowrap shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                               ✅ CERTIFICADO
                           </span>
                       )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Por {course.instructorName}</p>
                    
                    {/* TRIGGER DE RATING SI ESTÁ COMPLETADO */}
                    {course.progress === 100 && (
                      <ManualRatingButton courseId={course.id} userRating={course.userRating} />
                    )}
                    
                    <div className="mt-auto pt-4 space-y-4">
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                           <span>Progreso</span>
                           <span className="text-cyan-400">{course.progress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-[#0d1524] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-700" style={{ width: `${course.progress}%` }}></div>
                         </div>
                      </div>
                      
                      <Link 
                         href={`/dashboard/student/learn/${course.id}`}
                         className="block w-full py-3 bg-[#1e2a44] hover:bg-cyan-500 hover:text-black rounded-xl text-xs font-bold transition-all text-center"
                      >
                         Continuar →
                      </Link>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
