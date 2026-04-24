import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function InstructorCoursePreviewPage(props: { params: Promise<{ id: string }> }) {
   const params = await props.params;
   const { id } = params;
   const session = await getSession();

   if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

   const course = await prisma.course.findUnique({
     where: { id },
     include: {
       instructor: { select: { id: true, name: true, lastName: true } },
       modules: {
         orderBy: { orderIndex: 'asc' },
         include: {
           lessons: {
             orderBy: { orderIndex: 'asc' }
           }
         }
       }
     }
   });

   if (!course) notFound();

   // Seguridad: Solo el dueño del curso puede previsualizarlo aquí
   if (course.instructor.id !== session.userId) redirect('/dashboard/instructor/courses');

   return (
     <div className="space-y-10 animate-fade-in font-poppins">
       <div className="flex items-center justify-between">
         <Link href="/dashboard/instructor/courses" className="text-xs font-bold text-cyan-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
           ← Volver a Mis Cursos
         </Link>
         <div className="px-5 py-2 bg-green-500/20 border border-green-500/50 text-green-400 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-green-600/10">
            MODO PREVIEW — Vista del Instructor
         </div>
       </div>

       <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-3xl shadow-2xl">
         <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-blue-500/10 pb-10">
           <div>
             <h1 className="text-4xl font-space-grotesk font-extrabold text-white leading-none">{course.title}</h1>
             <p className="text-gray-400 mt-4 max-w-2xl text-sm leading-relaxed italic">"{course.description}"</p>
             <div className="flex gap-4 mt-6">
                <span className="text-[10px] font-bold text-cyan-400 border border-cyan-400/20 px-3 py-1 rounded-lg bg-cyan-400/5">{course.category}</span>
                <span className="text-[10px] font-bold text-gray-500 border border-gray-500/20 px-3 py-1 rounded-lg bg-gray-500/5">{course.level}</span>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tu Perfil de Instructor</p>
             <p className="text-xl font-bold text-white">{course.instructor.name} {course.instructor.lastName}</p>
             <p className="text-[10px] text-green-400 font-mono mt-1 opacity-60">ID: {course.id}</p>
           </div>
         </div>

         <div className="mt-12 space-y-10">
            <h3 className="text-xl font-space-grotesk font-bold text-white flex items-center gap-4">
               Estructura de Contenidos (Modo Alumno)
               <span className="h-[2px] flex-1 bg-gradient-to-r from-blue-600/50 to-transparent"></span>
            </h3>

            <div className="space-y-6">
               {course.modules.length === 0 ? (
                  <div className="p-20 text-center border-2 border-dashed border-blue-500/10 rounded-3xl">
                     <p className="text-gray-600 italic">Este curso aún no tiene módulos configurados.</p>
                  </div>
               ) : course.modules.map((module: any) => (
                  <div key={module.id} className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-xs font-bold text-blue-400">
                           {module.orderIndex}
                        </div>
                        <h4 className="text-lg font-bold text-gray-200">{module.title}</h4>
                     </div>

                     <div className="ml-12 grid grid-cols-1 gap-3">
                        {module.lessons.map((lesson: any) => (
                           <Link 
                             key={lesson.id} 
                             href={`/dashboard/instructor/courses/${course.id}/preview/lesson/${lesson.id}`}
                             className="bg-[#152035] border border-blue-500/10 p-5 rounded-2xl flex items-center justify-between hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group cursor-pointer"
                           >
                              <div className="flex items-center gap-4">
                                 <span className={`text-lg opacity-40 group-hover:opacity-100 transition-opacity`}>
                                    {lesson.contentType === 'VIDEO' ? '🎥' : lesson.contentType === 'QUIZ' ? '📝' : '📄'}
                                 </span>
                                 <div>
                                    <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{lesson.title}</p>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black italic">{lesson.contentType}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {lesson.isPreview && (
                                   <span className="text-[9px] font-bold text-green-400 bg-green-400/5 border border-green-400/20 px-2 py-0.5 rounded uppercase">Preview Gratis</span>
                                )}
                                <span className="text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">Ver Contenido →</span>
                              </div>
                           </Link>
                        ))}
                        {module.lessons.length === 0 && (
                           <p className="text-xs text-gray-600 italic ml-2">Sin lecciones en este módulo.</p>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
       </div>
     </div>
   );
}
