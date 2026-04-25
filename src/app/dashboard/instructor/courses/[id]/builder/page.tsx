'use client';
import { useState } from 'react';
import { useBuilder } from './layout';
import Link from 'next/link';
import { sanitizePayload } from '@/lib/utils/sanitize';

export default function BuilderIndexPage() {
  const { course, refetch } = useBuilder();
  const [saving, setSaving] = useState(false);

  const updateCourse = async (updates: any) => {
    setSaving(true);
    const res = await fetch(`/api/instructor/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizePayload(updates))
    });
    if (res.ok) await refetch();
    setSaving(false);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) return alert("Máximo 2MB permitido para el MVP");
        const reader = new FileReader();
        reader.onloadend = () => {
            updateCourse({ thumbnailUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 animate-fade-in font-poppins pb-32">
        <div className="flex flex-col lg:flex-row gap-12 mb-16 items-start">
           <div className="flex-1 text-left">
              <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4">Módulo de Configuración</h2>
              <h1 className="text-5xl font-space-grotesk font-black text-white leading-tight mb-6 italic uppercase tracking-tighter">
                Identidad del <span className="text-gray-500">Curso</span>
              </h1>
              
              <div className="space-y-6 max-w-2xl">
                 <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block italic">Título Principal</label>
                    <input 
                        value={course.title}
                        onChange={e => { /* Local state optimized in layout usually, but we'll use refetch */ }}
                        onBlur={e => updateCourse({ title: e.target.value })}
                        className="w-full bg-[#0d1524] border border-blue-500/10 rounded-2xl px-6 py-4 text-xl font-bold text-white focus:border-cyan-500 outline-none transition-all"
                        placeholder="Ej. Master en React Avanzado"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block italic">Categoría</label>
                        <select 
                            value={course.category}
                            onChange={e => updateCourse({ category: e.target.value })}
                            className="w-full bg-[#0d1524] border border-blue-500/10 rounded-xl px-6 py-4 text-xs font-bold text-gray-400 focus:text-white outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        >
                            <option value="BUSINESS">Negocios</option>
                            <option value="TECHNOLOGY">Tecnología</option>
                            <option value="MARKETING">Marketing</option>
                            <option value="FINANCE">Finanzas</option>
                            <option value="DESIGN">Diseño</option>
                            <option value="OTHER">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block italic">Nivel de Dificultad</label>
                        <select 
                            value={course.level}
                            onChange={e => updateCourse({ level: e.target.value })}
                            className="w-full bg-[#0d1524] border border-blue-500/10 rounded-xl px-6 py-4 text-xs font-bold text-gray-400 focus:text-white outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        >
                            <option value="BEGINNER">Principiante</option>
                            <option value="INTERMEDIATE">Intermedio</option>
                            <option value="ADVANCED">Avanzado</option>
                        </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block italic">Descripción Corta / Preview</label>
                    <textarea 
                        value={course.previewText || ''}
                        onBlur={e => updateCourse({ previewText: e.target.value })}
                        rows={3}
                        className="w-full bg-[#0d1524] border border-blue-500/10 rounded-2xl px-6 py-4 text-sm text-gray-300 focus:border-cyan-500 outline-none transition-all resize-none font-light leading-relaxed"
                        placeholder="Resume de qué trata tu curso en 2 líneas..."
                    />
                 </div>
              </div>
           </div>
           
           {/* THUMBNAIL LOADER */}
           <div className="w-full lg:w-80 space-y-6">
                <div className="group relative">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 italic text-center">Imagen de Portada</label>
                    <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-[#0d1524] border-2 border-dashed border-blue-500/10 group-hover:border-cyan-500/40 transition-all cursor-pointer shadow-3xl">
                        {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt="Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 p-8 text-center">
                                <span className="text-5xl mb-4 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">🖼️</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-tight">Click para cargar <br/> (2MB Máx)</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        <div className="absolute inset-0 bg-cyan-900/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest border border-white/20 px-6 py-2 rounded-xl">Reemplazar</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#070d1a] border border-blue-500/5 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Visibilidad</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-400 bg-cyan-400/5`}>{course.visibility}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Precio Lista</span>
                        <span className="text-xl font-space-grotesk font-black text-white italic">${Number(course.price).toLocaleString()} MXN</span>
                    </div>
                </div>
           </div>
        </div>

        {/* STATS PREVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
           <div className="bg-[#0d1524] border border-white/5 rounded-[2.5rem] p-10 hover:border-cyan-500/20 transition-all group shadow-3xl">
              <div className="text-4xl mb-6 group-hover:-translate-y-2 transition-transform duration-500">🧱</div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Arquitectura</h3>
              <p className="text-2xl font-black text-white tracking-tighter italic uppercase">{course.modules?.length || 0} Módulos</p>
              <p className="text-[10px] text-gray-700 mt-2 font-mono italic">Estructura base del curso</p>
           </div>
           <div className="bg-[#0d1524] border border-white/5 rounded-[2.5rem] p-10 hover:border-blue-500/20 transition-all group shadow-3xl">
              <div className="text-4xl mb-6 group-hover:-translate-y-2 transition-transform duration-500">📺</div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Streaming</h3>
              <p className="text-2xl font-black text-white tracking-tighter italic uppercase">{course.modules?.reduce((a: any, m: any) => a + (m.lessons?.length || 0), 0)} Lecciones</p>
              <p className="text-[10px] text-gray-700 mt-2 font-mono italic">Contenido multimedia activo</p>
           </div>
           <div className="bg-[#0d1524] border border-white/5 rounded-[2.5rem] p-10 hover:border-purple-500/20 transition-all group shadow-3xl">
              <div className="text-4xl mb-6 group-hover:-translate-y-2 transition-transform duration-500">🎯</div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Evaluación</h3>
              <p className="text-2xl font-black text-white tracking-tighter italic uppercase">{course.quizzes?.length || 0} Exámenes</p>
              <p className="text-[10px] text-gray-700 mt-2 font-mono italic">Control de calidad y aprobación</p>
           </div>
        </div>

        {/* CTA BOTTOM */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161b22] to-[#0d1524] border border-white/5 rounded-[4rem] p-16 text-center shadow-3xl">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
           <h2 className="text-3xl font-space-grotesk font-black text-white mb-4 uppercase tracking-tighter italic">¿Listo para el <span className="text-cyan-400">Despliegue</span>?</h2>
           <p className="text-gray-500 text-sm max-w-xl mx-auto mb-10 font-light leading-relaxed">
             Asegúrate de que cada módulo tenga al menos una lección con contenido. Las evaluaciones finales son opcionales pero recomendadas para la certificación automática.
           </p>
            {(() => {
                // Sincronizar con el backend: buscar la primera lección válida (módulo y lección con orderIndex más bajo)
                const sortedModules = [...(course.modules || [])].sort((a,b) => a.orderIndex - b.orderIndex);
                const firstModule = sortedModules[0];
                const sortedLessons = firstModule ? [...(firstModule.lessons || [])].sort((a,b) => a.orderIndex - b.orderIndex) : [];
                const firstLesson = sortedLessons[0];
                
                const targetHref = firstLesson 
                    ? `/dashboard/instructor/courses/${course.id}/builder/lesson/${firstLesson.id}`
                    : `/dashboard/instructor/courses/${course.id}/builder`;

                return (
                  <Link 
                    href={targetHref}
                    className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-white transition-all shadow-2xl hover:shadow-cyan-500/40 active:scale-95 shadow-lg"
                  >
                    {firstLesson ? '📦 Ir al Editor de Contenido' : '🧱 Comenzar Estructura'}
                  </Link>
                );
              })()}
        </div>

        <style jsx global>{`
           .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
           @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
           .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7); }
        `}</style>
    </div>
  );
}
