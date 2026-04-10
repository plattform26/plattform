import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Componente SSR que recupera el curso
export default async function CourseDetail({ params }: { params: { slug: string } }) {
  const session = await getSession();

  const res = await fetch(`http://localhost:3001/api/courses/${params.slug}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 404) return notFound();
    return <div className="p-10 text-red-500">Error loading course</div>;
  }

  const course = await res.json();

  let isEnrolled = false;
  if (session) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: course.id,
        }
      }
    });
    isEnrolled = !!enrollment || session.role === 'ADMIN';
  }

  // Lógica de redirección para el botón
  const checkoutUrl = session 
    ? `/checkout?courseId=${course.id}`
    : `/register/student`;

  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      {/* NAV SIMPLE */}
      <nav className="flex items-center justify-between px-10 h-16 bg-[#0a1f44] border-b border-blue-500/20 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-lg tracking-wider">
           <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">PLATTFORM</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-sm font-semibold border border-blue-500/30 px-4 py-2 rounded text-cyan-400 hover:bg-blue-500/10 transition-colors">← Volver al catálogo</Link>
          {session && (
            <Link 
              href={session.role === 'ADMIN' ? '/dashboard/admin' : session.role === 'INSTRUCTOR' ? '/dashboard/instructor' : '/dashboard/student'} 
              className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all uppercase tracking-widest"
            >
              Dashboard →
            </Link>
          )}
        </div>
      </nav>

      {/* PORTADA DEL CURSO */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2">
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-6">
            <span>{course.category}</span>
          </div>
          
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {course.title}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-12 text-sm text-gray-400 border-b border-blue-500/20 pb-8">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-lg">★★★★★</span>
              <span className="font-semibold text-white">{course.stats.averageRating.toFixed(1)}</span>
              <span>({course.stats.reviewCount} reseñas)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <span className="font-semibold text-white">{course.stats.studentCount}</span> alumnos
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱</span>
              <span className="font-semibold text-white">{course.durationHours}</span> horas
            </div>
          </div>

          <h2 className="font-space-grotesk text-2xl font-bold mb-6 text-white">Contenido del <span className="text-cyan-400">curso</span></h2>
          <div className="bg-[#152035] border border-blue-500/20 rounded-2xl overflow-hidden mb-12">
            {course.modules.map((mod: any, idx: number) => (
              <div key={mod.id} className={`border-b border-blue-500/10 ${idx === course.modules.length - 1 ? 'border-b-0' : ''}`}>
                <div className="px-6 py-4 bg-[#1a2a45] font-semibold text-gray-200">
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-1">Módulo {mod.orderIndex}</span>
                  {mod.title}
                </div>
                <div className="bg-[#0f1829] flex flex-col">
                  {mod.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center gap-3 px-6 py-3 border-b border-blue-500/5 last:border-0 hover:bg-blue-500/5 transition-colors">
                      <span className="text-gray-500 text-xs w-4">1.{lesson.orderIndex}</span>
                      <span className="text-gray-300 text-sm flex-1">{lesson.title}</span>
                      {lesson.isPreview ? (
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Vista Previa</span>
                      ) : (
                        <span className="text-xs text-blue-400">🔒 Contenido bloqueado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* INSTRUCTOR CARD */}
          <h2 className="font-space-grotesk text-2xl font-bold mb-6 text-white">Sobre el <span className="text-cyan-400">profesor</span></h2>
          <div className="flex gap-4 items-start bg-gradient-to-br from-[#152035] to-[#0a1f44] border border-blue-500/20 p-6 rounded-2xl">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold uppercase overflow-hidden flex-shrink-0">
               {course.instructor.name.charAt(0)}{course.instructor.name.split(' ')[1]?.charAt(0)}
            </div>
            <div>
              <Link href={`/instructor/${course.instructor.instructorProfile?.slug || ''}`} className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors block mb-1">
                {course.instructor.name}
              </Link>
              <div className="text-sm text-gray-400 mb-3">{course.instructor.institution || course.instructor.academyName}</div>
              <p className="text-sm text-gray-300 leading-relaxed font-light">{course.instructor.description}</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (FLOATING CHECKOUT) */}
        <div>
          <div className="sticky top-24 bg-[#152035] border border-blue-500/30 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="aspect-video bg-gradient-to-br from-cyan-900 to-blue-900 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden group cursor-pointer">
               <span className="text-4xl group-hover:scale-110 transition-transform">▶️</span>
               <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-2 py-1 rounded text-cyan-300 font-bold uppercase tracking-wide">Video demo</div>
            </div>
            
            <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
              ${course.price}
            </div>
            <div className="text-xs text-gray-400 mb-6">Precios en MXN, impuestos incluidos.</div>

            {isEnrolled ? (
              <Link
                href={`/dashboard/student/learn/${course.id}`}
                className="w-full py-4 text-center text-sm font-bold bg-green-600 text-white rounded-xl shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 mb-4"
              >
                Ir al aula →
              </Link>
            ) : (
              <Link
                href={checkoutUrl}
                className="w-full py-4 text-center text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 mb-4"
              >
                Comprar este curso por ${course.price} MXN →
              </Link>
            )}


            <hr className="border-blue-500/10 my-6" />
            
            <div className="text-sm font-semibold text-gray-200 mb-4">Este curso incluye:</div>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3"><span className="text-cyan-400 text-lg">🎥</span> {course.durationHours} horas de video</li>
              <li className="flex items-center gap-3"><span className="text-cyan-400 text-lg">📄</span> {course.modules.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0)} recursos descargables</li>
              <li className="flex items-center gap-3"><span className="text-cyan-400 text-lg">♾️</span> Acceso de por vida</li>
              <li className="flex items-center gap-3"><span className="text-cyan-400 text-lg">🎓</span> Certificado de finalización</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
