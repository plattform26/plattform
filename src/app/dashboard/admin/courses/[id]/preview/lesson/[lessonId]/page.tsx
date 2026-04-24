import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AdminLessonPreviewPage(props: { params: Promise<{ id: string, lessonId: string }> }) {
   const params = await props.params;
   const { id: courseId, lessonId } = params;

   const lesson = await prisma.courseLesson.findUnique({
     where: { id: lessonId },
     include: {
       module: {
         include: {
           lessons: {
             orderBy: { orderIndex: 'asc' },
             select: { id: true, title: true, subtitle: true, contentText: true, videoUrl: true, contentType: true }
           }
         }
       }
     }
   });

   if (!lesson || lesson.courseId !== courseId) notFound();

   // Buscar lección previa y siguiente
   const lessons = lesson.module?.lessons || [];
   const currIdx = lessons.findIndex((l: any) => l.id === lessonId);
   const prevLesson = currIdx > 0 ? lessons[currIdx - 1] : null;
   const nextLesson = currIdx < lessons.length - 1 ? lessons[currIdx + 1] : null;

   return (
     <div className="min-h-screen bg-[#070d1a] text-white font-poppins">
       <header className="h-16 flex items-center justify-between px-8 border-b border-red-500/20 bg-red-500/5 sticky top-0 z-50 backdrop-blur-md">
         <div className="flex items-center gap-4">
           <Link href={`/dashboard/admin/courses/${courseId}/preview`} className="text-xs font-bold text-gray-400 hover:text-white transition-all">← Volver al Temario</Link>
           <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
           <span className="text-xs font-bold text-white uppercase tracking-widest truncate max-w-[300px]">{lesson.title}</span>
         </div>
         <div className="px-4 py-1.5 bg-red-500 border border-red-400 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-red-500/20">
            VISTA ADMIN — SOLO LECTURA
         </div>
       </header>

       <main className="max-w-5xl mx-auto px-6 py-12">
         {lesson.contentType === 'VIDEO' ? (
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-blue-500/10 mb-10 flex items-center justify-center group relative cursor-not-allowed">
               <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📽️</div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">El video se cargaría aquí</p>
                  <p className="text-[10px] text-gray-700 mt-2 font-mono">ID: {lesson.videoUrl || 'N/A'}</p>
               </div>
               <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
            </div>
         ) : (
            <div className="bg-[#0d1524] border border-blue-500/10 rounded-3xl p-10 mb-10 shadow-2xl relative">
               <article className="prose prose-invert prose-blue max-w-none prose-headings:font-space-grotesk prose-headings:font-bold prose-p:text-gray-300 prose-p:leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: lesson.contentText || '<p className="italic text-gray-500">Sin contenido textual.</p>' }} />
               </article>
               <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
            </div>
         )}

         {lesson.contentType === 'QUIZ' && (
            <div className="bg-[#152035] border border-purple-500/20 rounded-3xl p-10 mb-10 text-center relative">
               <div className="text-4xl mb-4">📝</div>
               <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Evaluación del Módulo</h2>
               <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">En el modo de auditoría, las evaluaciones no son interactivas para prevenir la modificación de registros.</p>
               <div className="inline-block px-6 py-2.5 rounded-xl border border-purple-500/30 text-purple-400 text-xs font-bold uppercase opacity-50">Quiz Deshabilitado</div>
               <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
            </div>
         )}

         <div className="mt-20 pt-10 border-t border-blue-500/10 flex items-center justify-between">
            {prevLesson ? (
               <Link href={`/dashboard/admin/courses/${courseId}/preview/lesson/${prevLesson.id}`} className="px-6 py-3 rounded-2xl bg-[#0d1524] border border-blue-500/10 text-xs font-bold text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all uppercase tracking-widest">
                  ← Lección Anterior
               </Link>
            ) : <div />}
            
            {nextLesson ? (
               <Link href={`/dashboard/admin/courses/${courseId}/preview/lesson/${nextLesson.id}`} className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-cyan-500 hover:text-black transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest">
                  Siguiente Lección →
               </Link>
            ) : (
               <Link href={`/dashboard/admin/courses/${courseId}/preview`} className="px-6 py-3 rounded-2xl bg-green-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest">
                  Finalizar Auditoría
               </Link>
            )}
         </div>
       </main>
     </div>
   );
}
