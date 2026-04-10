'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Lesson {
  id: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  videoUrl?: string | null;
  contentType: string;
}

export default function InlineLessonEditor({ lesson }: { lesson: Lesson }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: lesson.title,
    subtitle: lesson.subtitle || '',
    content: lesson.content || '',
    videoUrl: lesson.videoUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón de edición flotante / Edit Trigger */}
      <button 
        onClick={() => setIsEditing(true)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-cyan-500 text-black rounded-full shadow-2xl shadow-cyan-500/40 flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all z-50 group"
        title="Editar Lección"
      >
        ✏️
        <span className="absolute right-full mr-4 bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest pointer-events-none">Editar esta lección</span>
      </button>

      {/* Modal de edición */}
      {isEditing && (
        <div className="fixed inset-0 bg-[#070d1a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in font-poppins">
          <div className="bg-[#0d1524] border border-cyan-500/20 w-full max-w-2xl rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-pulse"></div>
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-space-grotesk font-black text-white uppercase tracking-tight">Editor <span className="text-cyan-400">Rápido</span></h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.2em] font-bold">MODO EDICI&Oacute;N INLINE — Los cambios son inmediatos</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-3xl text-gray-600 hover:text-white transition-colors leading-none">×</button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-cyan-500/10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Título de la Lección</label>
                <input 
                  type="text" value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Subtítulo / Descripción Corta</label>
                <input 
                  type="text" value={formData.subtitle}
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 outline-none transition-all"
                  placeholder="Opcional..."
                />
              </div>

              {lesson.contentType === 'VIDEO' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">URL del Video (YouTube / Vimeo / Directo)</label>
                  <input 
                    type="text" value={formData.videoUrl}
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full bg-[#152035] border border-cyan-500/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-400 outline-none transition-all font-mono text-xs"
                    placeholder="https://..."
                  />
                </div>
              )}

              {lesson.contentType !== 'QUIZ' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Contenido (HTML soportado)</label>
                  <textarea 
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 outline-none transition-all h-64 font-light leading-relaxed scrollbar-thin"
                    placeholder="Escribe el contenido de la lección aquí..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 border border-blue-500/20 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Confirmar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
