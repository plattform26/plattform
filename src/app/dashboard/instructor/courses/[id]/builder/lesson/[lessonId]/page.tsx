'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BuilderRichEditor from '@/components/builder/BuilderRichEditor';
import { sanitizePayload } from '@/lib/utils/sanitize';

export default function BuilderLessonPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}`);
      if (res.ok) {
          const data = await res.json();
          setLesson(data);
      } else if (res.status === 404) {
          // Si no se encuentra la lección, intentar recalibrar con la primera lección del curso
          const courseRes = await fetch(`/api/courses/${courseId}`);
          if (courseRes.ok) {
              const courseData = await courseRes.json();
              const sortedModules = [...(courseData.modules || [])].sort((a, b) => a.orderIndex - b.orderIndex);
              const firstModule = sortedModules[0];
              const sortedLessons = firstModule ? [...(firstModule.lessons || [])].sort((a, b) => a.orderIndex - b.orderIndex) : [];
              const firstValidLesson = sortedLessons[0];

              if (firstValidLesson) {
                  router.push(`/dashboard/instructor/courses/${courseId}/builder/lesson/${firstValidLesson.id}`);
                  return;
              } else {
                  router.push(`/dashboard/instructor/courses/${courseId}/builder`);
                  return;
              }
          }
      }
    } catch (err) {
      console.error("Fetch lesson error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const updateLesson = async (updates: any) => {
    setSaving(true);
    const res = await fetch(`/api/instructor/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizePayload(updates))
    });
    if (res.ok) {
        setMsg('✓ Sincronizado');
        const data = await res.json();
        setLesson(data);
        setTimeout(() => setMsg(''), 2000);
    }
    setSaving(false);
  };

    const insertDYK = () => {
        const dyk = `
            <div class="did-you-know">
                <b class="text-cyan-400 uppercase tracking-widest text-xs block mb-2 font-black">¿Sabías que?</b>
                Escribe aquí un dato curioso o punto clave de la lección...
            </div>
            <p>&nbsp;</p>
        `;
        document.execCommand('insertHTML', false, dyk);
    };

    if (loading) return <div className="p-20 text-center text-gray-500 animate-pulse font-mono tracking-widest text-[10px] uppercase">Decodificando Contenido de la Lección... {lessonId}</div>;
    if (!lesson) return (
        <div className="p-20 text-center space-y-8 animate-fade-in">
            <div className="text-7xl animate-bounce">🏜️</div>
            <div className="space-y-4">
                <h2 className="text-2xl font-space-grotesk font-black text-red-500 uppercase tracking-[0.2em] italic">Error: Nodo de Lección Perdido</h2>
                <p className="text-gray-500 text-sm italic font-light max-w-md mx-auto">
                    El identificador <span className="text-cyan-400 font-mono">"{lessonId}"</span> no responde en el cluster de datos. Esto puede ocurrir si la lección fue eliminada o movida.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button 
                    onClick={fetchLesson} 
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2"
                >
                    🔄 Reintentar Sincronización
                </button>
                <Link 
                    href={`/dashboard/instructor/courses/${courseId}/builder`}
                    className="px-8 py-4 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
                >
                    ⬅️ Volver a la Estructura
                </Link>
            </div>
        </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-10 animate-fade-in font-poppins pb-40">
        {msg && <div className="fixed bottom-10 right-10 z-[200] bg-cyan-500 text-white font-black text-[9px] px-6 py-3 rounded-xl shadow-2xl animate-bounce uppercase tracking-widest">{msg}</div>}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div className="flex-1">
                <Link href={`/dashboard/instructor/courses/${courseId}/builder`} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-cyan-400 transition-all flex items-center gap-2 mb-6">
                    ← Volver a la Estructura del Curso
                </Link>
                <div className="flex flex-col gap-2">
                    <input 
                        value={lesson.title}
                        onChange={e => setLesson({ ...lesson, title: e.target.value })}
                        onBlur={e => updateLesson({ title: e.target.value })}
                        className="text-4xl font-space-grotesk font-black text-white bg-transparent border-b-2 border-transparent focus:border-cyan-500 outline-none w-full italic tracking-tighter uppercase"
                        placeholder="Título de la Lección"
                    />
                    <input 
                        value={lesson.subtitle || ''}
                        onChange={e => setLesson({ ...lesson, subtitle: e.target.value })}
                        onBlur={e => updateLesson({ subtitle: e.target.value })}
                        className="text-sm font-bold text-gray-500 bg-transparent border-b border-transparent focus:border-cyan-500/30 outline-none w-full italic"
                        placeholder="Subtítulo o descripción breve de la lección..."
                    />
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <button 
                  onClick={() => updateLesson({
                      title: lesson.title,
                      subtitle: lesson.subtitle,
                      contentText: lesson.contentText,
                      videoUrl: lesson.videoUrl,
                      contentType: lesson.contentType,
                      durationMinutes: lesson.durationMinutes,
                      isPreview: lesson.isPreview
                  }).then(() => router.push(`/dashboard/instructor/courses/${courseId}/builder`))}
                  disabled={saving}
                  className="px-8 py-4 bg-cyan-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-3"
                >
                    {saving ? '📦 GUARDANDO...' : '📦 GUARDAR LECCIÓN'}
                </button>
                <div className="bg-[#0d1524] p-4 rounded-3xl border border-blue-500/10 shadow-3xl flex gap-4 items-center">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic leading-none mb-1">Duración Est.</p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number"
                                value={lesson.durationMinutes || 0}
                                onChange={e => setLesson({ ...lesson, durationMinutes: parseInt(e.target.value) || 0 })}
                                onBlur={e => updateLesson({ durationMinutes: parseInt(e.target.value) || 0 })}
                                className="w-12 bg-transparent text-lg font-black text-white outline-none font-space-grotesk text-center p-0"
                            />
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">MIN</span>
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/5 mx-2"></div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Tipo de Contenido</label>
                        <select 
                            value={lesson.contentType}
                            onChange={e => {
                                const newType = e.target.value;
                                setLesson({ ...lesson, contentType: newType });
                                updateLesson({ contentType: newType });
                            }}
                            className="bg-[#152035] border border-cyan-500/20 rounded-xl px-4 py-1.5 text-[10px] font-black text-cyan-400 uppercase tracking-widest outline-none focus:border-cyan-400"
                        >
                            <option value="VIDEO">📺 Video Streaming</option>
                            <option value="TEXT">📄 Texto Enriquecido</option>
                            <option value="QUIZ">🎯 Evaluación Final</option>
                        </select>
                    </div>
                </div>
            </div>

        </div>

        {/* CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* MAIN EDITOR */}
            <div className="lg:col-span-8 space-y-10">
                {lesson.contentType === 'VIDEO' && (
                    <div className="bg-[#161b22] border border-white/5 rounded-[3rem] p-10 shadow-3xl group">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 block italic">Fuente del Video (Master Link)</label>
                         <div className="relative">
                            <input 
                                value={lesson.videoUrl || ''}
                                onChange={e => setLesson({ ...lesson, videoUrl: e.target.value })}
                                onBlur={e => updateLesson({ videoUrl: e.target.value })}
                                className="w-full bg-[#070d1a] border border-blue-500/10 rounded-2xl px-10 py-5 text-sm text-cyan-400 font-mono focus:border-cyan-500 outline-none transition-all placeholder:text-gray-800"
                                placeholder="https://vimeo.com/..."
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 grayscale opacity-30 group-hover:grayscale-0 transition-grayscale">🔗</span>
                         </div>
                         <p className="mt-4 text-[9px] text-gray-700 font-bold uppercase tracking-widest italic">* Se recomienda usar Vimeo o YouTube (Privado/Oculto) para el streaming de alta calidad.</p>
                    </div>
                )}

                <div className="bg-[#161b22] border border-white/5 rounded-[3rem] p-10 shadow-3xl">
                    <div className="flex justify-between items-center mb-6">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Cuerpo de la Lección (Rich Text Editor)</label>
                         {saving && <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Escribiendo en disco...</span>}
                    </div>
                    
                    <BuilderRichEditor 
                        value={lesson.contentText}
                        onChange={html => setLesson({ ...lesson, contentText: html })}
                    />
                </div>

                {/* VIDEO PREVIEW */}
                {lesson.contentType === 'VIDEO' && lesson.videoUrl && (
                    <div className="bg-[#161b22] border border-white/5 rounded-[3rem] p-10 shadow-3xl overflow-hidden mt-10">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6 block italic">Previsualización del Video</label>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5">
                            {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                                <iframe 
                                    src={`https://www.youtube.com/embed/${lesson.videoUrl.split('v=')[1]?.split('&')[0] || lesson.videoUrl.split('/').pop()}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            ) : lesson.videoUrl.includes('vimeo.com') ? (
                                <iframe 
                                    src={`https://player.vimeo.com/video/${lesson.videoUrl.split('/').pop()}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-mono">
                                    [ Formato de Video Desconocido o No Soportado para Preview ]
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* SIDEBAR / CONFIG */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4 italic">Panel de Despliegue</h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-600 uppercase italic">Preview Público</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={lesson.isPreview} onChange={e => updateLesson({ isPreview: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-[#070d1a] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                </label>
                            </div>

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                    Si el "Preview" está activado, los alumnos no inscritos podrán ver esta lección como una muestra comercial del curso.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {lesson.contentType === 'QUIZ' && (
                    <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 p-10 rounded-[3rem] shadow-3xl text-center group">
                        <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4 italic">Módulo de Evaluación</h4>
                        <p className="text-gray-400 text-xs font-light mb-8 leading-relaxed">Configura el examen final de esta lección para determinar la aprobación automática del alumno.</p>
                        <Link 
                            href={`/dashboard/instructor/courses/${courseId}/builder/quiz/${lessonId}`}
                            className="block w-full py-4 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-600/20"
                        >
                            🧠 Abrir Quiz Builder
                        </Link>
                    </div>
                )}
            </div>
        </div>

        <style jsx global>{`
           .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
           @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
           .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7); }
        `}</style>
    </div>
  );
}
