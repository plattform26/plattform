import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import InlineLessonEditor from '@/components/InlineLessonEditor';

export default async function InstructorLessonPreviewPage({ params }: { params: { id: string, lessonId: string } }) {
  const { id: courseId, lessonId } = params;
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

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

  // Seguridad: Solo el dueño del curso puede previsualizarlo
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  if (!course || course.instructorId !== session.userId) redirect('/dashboard/instructor/courses');

  // Buscar lección previa y siguiente
  const lessons = lesson.module?.lessons || [];
  const currIdx = lessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = currIdx > 0 ? lessons[currIdx - 1] : null;
  const nextLesson = currIdx < lessons.length - 1 ? lessons[currIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#070d1a] text-white font-poppins">
      <header className="h-16 flex items-center justify-between px-8 border-b border-green-500/20 bg-green-500/5 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/instructor/courses/${courseId}/preview`} className="text-xs font-bold text-gray-400 hover:text-white transition-all">← Volver al Temario</Link>
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xs font-bold text-white uppercase tracking-widest truncate max-w-[300px]">{lesson.title}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">✏️</span>
          </div>
        </div>
        <div className="px-5 py-1.5 bg-green-500 border border-green-400 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-green-600/20">
           MODO EDICI&Oacute;N/PREVIEW — S&oacute;lo t&uacute; ves esto
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {lesson.contentType === 'VIDEO' ? (
           <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-blue-500/10 mb-10 flex items-center justify-center group relative cursor-pointer">
              <div className="text-center">
                 <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📽️</div>
                 <p className="text-gray-500 text-sm font-bold uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Configuraci&oacute;n de Video</p>
                 <p className="text-[10px] text-gray-700 mt-2 font-mono truncate max-w-sm px-4 italic">{lesson.videoUrl || 'Sin URL asignada. Haz clic para editar.'}</p>
              </div>
              <div className="absolute inset-0 bg-green-500/5 group-hover:bg-cyan-500/10 pointer-events-none transition-colors"></div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-2xl drop-shadow-lg">✏️</div>
           </div>
        ) : (
           <div className="bg-[#0d1524] border border-blue-500/10 rounded-3xl p-10 mb-10 shadow-2xl relative group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-2xl">✏️</div>
              <article className="prose prose-invert prose-blue max-w-none prose-headings:font-space-grotesk prose-headings:font-bold prose-p:text-gray-300 prose-p:leading-relaxed">
                 <div dangerouslySetInnerHTML={{ __html: lesson.contentText || '<p className="italic text-gray-500 font-light">Escribiendo contenido...</p>' }} />
              </article>
              <div className="absolute inset-0 bg-green-500/5 group-hover:bg-cyan-500/10 pointer-events-none transition-colors"></div>
           </div>
        )}

        {lesson.contentType === 'QUIZ' && (
           <div className="bg-[#152035] border border-purple-500/20 rounded-3xl p-10 mb-10 text-center relative overflow-hidden">
              <div className="relative z-10">
                 <div className="text-4xl mb-4">📝</div>
                 <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Evaluaci&oacute;n del M&oacute;dulo</h2>
                 <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">En el modo de previsualizaci&oacute;n, puedes ver la estructura pero el quiz no es interactivo para que no genere resultados de prueba en tu cuenta.</p>
                 <div className="inline-block px-6 py-2.5 rounded-xl border border-purple-500/30 text-purple-400 text-xs font-bold uppercase opacity-50">Quiz Deshabilitado en Preview</div>
              </div>
              <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>
           </div>
        )}

        {/* CONTROLES DE NAVEGACION */}
        <div className="mt-20 pt-10 border-t border-blue-500/10 flex items-center justify-between">
           {prevLesson ? (
              <Link href={`/dashboard/instructor/courses/${courseId}/preview/lesson/${prevLesson.id}`} className="px-6 py-3 rounded-2xl bg-[#0d1524] border border-blue-500/10 text-xs font-bold text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all uppercase tracking-widest">
                 &larr; Lecci&oacute;n Anterior
              </Link>
           ) : <div />}
           
           {nextLesson ? (
              <Link href={`/dashboard/instructor/courses/${courseId}/preview/lesson/${nextLesson.id}`} className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-cyan-500 hover:text-black transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest">
                 Siguiente Lecci&oacute;n &rarr;
              </Link>
           ) : (
              <Link href={`/dashboard/instructor/courses/${courseId}/preview`} className="px-6 py-3 rounded-2xl bg-green-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest">
                 Finalizar Previsualizaci&oacute;n
              </Link>
           )}
        </div>

        {/* EDITOR INLINE */}
        <InlineLessonEditor 
           lesson={{ 
              id: lesson.id, 
              title: lesson.title, 
              subtitle: lesson.subtitle, 
              content: lesson.contentText, 
              videoUrl: lesson.videoUrl, 
              contentType: lesson.contentType 
           }} 
        />
      </main>
    </div>
  );
}
