'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BuilderRichEditor from '@/components/builder/BuilderRichEditor';

// ── Lesson Editor ──────────────────────────────────────────────────────────
function LessonEditor({
  lesson, moduleId, courseId, onSave, onDelete
}: {
  lesson: any; moduleId: string; courseId: string; onSave: (l: any) => void; onDelete: (id: string) => void;
}) {
  const [data, setData] = useState({
    title: lesson.title,
    subtitle: lesson.subtitle ?? '',
    contentText: lesson.contentText ?? '',
    videoUrl: lesson.videoUrl ?? '',
    isPreview: lesson.isPreview ?? false,
    durationMinutes: lesson.durationMinutes ?? '',
    contentType: lesson.contentType ?? 'TEXT',
    summary: lesson.summary ?? '',
    funFact: lesson.funFact ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, moduleId }),
    });
    const d = await res.json();
    if (res.ok) {
      onSave(d);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar lección "${lesson.title}"?`)) return;
    await fetch(`/api/lessons/${lesson.id}`, { method: 'DELETE' });
    onDelete(lesson.id);
  };

  return (
    <div className="bg-[#0a1626] border border-blue-500/15 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-500/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-gray-500 text-xs font-mono shrink-0">
            {data.contentType === 'VIDEO' ? '🎬' : data.contentType === 'QUIZ' ? '📝' : '📄'}
          </span>
          {open ? (
            <input
              value={data.title}
              onChange={e => setData({ ...data, title: e.target.value })}
              onClick={e => e.stopPropagation()}
              className="bg-transparent border-b border-blue-500/30 text-sm text-white focus:outline-none focus:border-cyan-500 flex-1 min-w-0"
            />
          ) : (
            <span className="text-sm text-white truncate">{data.title}</span>
          )}
        </div>
        <div 
          className="flex items-center justify-center w-8 h-8 hover:bg-white/5 rounded-full transition-all cursor-pointer group"
          onClick={e => { e.stopPropagation(); setOpen(!open); }}
          title={open ? "Ver menos" : "Ver más detalles"}
        >
          <span className="text-gray-500 text-[10px] group-hover:text-cyan-400 transition-colors">{open ? '▲' : '▼'}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {saved && <span className="text-green-400 text-xs">✓</span>}
          <button onClick={handleDelete} className="text-red-400/60 hover:text-red-400 transition-colors text-xs px-1">✕</button>
        </div>
      </div>

      {open && (
        <div className="p-4 border-t border-blue-500/10 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Subtítulo</label>
            <input
              value={data.subtitle}
              onChange={e => setData({ ...data, subtitle: e.target.value })}
              placeholder="Descripción corta de la lección"
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Duración (min)</label>
              <input
                type="number"
                value={data.durationMinutes}
                onChange={e => setData({ ...data, durationMinutes: e.target.value })}
                placeholder="15"
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600"
              />
            </div>
            <div className="flex flex-col justify-end">
              <input
                value={data.videoUrl}
                onChange={e => setData({ ...data, videoUrl: e.target.value })}
                placeholder="Enlace del video (Opcional)"
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Puntos Clave (Resumen)</label>
              <textarea
                value={data.summary}
                onChange={e => setData({ ...data, summary: e.target.value })}
                placeholder="Lo más importante de esta lección..."
                rows={2}
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600 resize-none font-light"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">¿Sabías que? (Dato curioso)</label>
              <textarea
                value={data.funFact}
                onChange={e => setData({ ...data, funFact: e.target.value })}
                placeholder="Un dato extra que los sorprenda..."
                rows={2}
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600 resize-none font-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Contenido de la lección</label>
            <BuilderRichEditor
              value={data.contentText}
              onChange={v => setData(prev => ({ ...prev, contentText: v }))}
            />
          </div>

            <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? '...' : 'Guardar lección'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Module Block ───────────────────────────────────────────────────────────
function ModuleBlock({
  mod, courseId, onDelete, onLessonAdd, onLessonUpdate, onLessonDelete, onTitleChange
}: any) {
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(mod.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [open, setOpen] = useState(true);

  const saveTitle = async () => {
    await fetch(`/api/modules/${mod.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleVal }),
    });
    onTitleChange(mod.id, titleVal);
    setEditTitle(false);
  };

  const addLesson = async () => {
    if (!newLessonTitle.trim()) return;
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, moduleId: mod.id, title: newLessonTitle }),
    });
    const lesson = await res.json();
    if (res.ok) {
      onLessonAdd(mod.id, lesson);
      setNewLessonTitle('');
      setAddingLesson(false);
    }
  };

  return (
    <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl overflow-hidden mb-4">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-[#0f1d30] hover:bg-blue-500/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 flex-1" onClick={e => editTitle && e.stopPropagation()}>
          <span className="text-gray-500 text-xs font-mono">☰</span>
          {editTitle ? (
            <input
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === 'Enter' && saveTitle()}
              autoFocus
              className="bg-[#070d1a] border border-cyan-500/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none flex-1"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="font-semibold text-white text-sm">{titleVal}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-gray-500">{mod.lessons?.length ?? 0} lecciones</span>
          <button onClick={() => setEditTitle(true)} className="text-gray-500 hover:text-white text-xs px-2 py-1 transition-colors">✏️</button>
          <button onClick={() => onDelete(mod.id)} className="text-red-400/50 hover:text-red-400 text-xs px-2 py-1 transition-colors">✕</button>
          <div 
            className="flex items-center justify-center w-8 h-8 hover:bg-white/5 rounded-full transition-all cursor-pointer group ml-1"
            onClick={e => { e.stopPropagation(); setOpen(!open); }}
            title={open ? "Colapsar módulo" : "Expandir módulo"}
          >
            <span className="text-gray-500 text-[10px] group-hover:text-cyan-400 transition-colors">{open ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-2">
          {(mod.lessons ?? []).map((lesson: any) => (
            <LessonEditor
              key={lesson.id}
              lesson={lesson}
              moduleId={mod.id}
              courseId={courseId}
              onSave={updated => onLessonUpdate(mod.id, updated)}
              onDelete={lessonId => onLessonDelete(mod.id, lessonId)}
            />
          ))}

          {addingLesson ? (
            <div className="flex gap-2">
              <input
                value={newLessonTitle}
                onChange={e => setNewLessonTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLesson()}
                placeholder="Título de la lección..."
                autoFocus
                className="flex-1 bg-[#070d1a] border border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none placeholder-gray-600"
              />
              <button onClick={addLesson} className="px-4 py-2 bg-cyan-500 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-colors">Agregar</button>
              <button onClick={() => { setAddingLesson(false); setNewLessonTitle(''); }} className="px-3 py-2 text-gray-400 hover:text-white text-xs">✕</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setAddingLesson(true)}
                className="w-full border border-dashed border-blue-500/20 hover:border-cyan-500/40 rounded-xl py-2.5 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              >
                + Agregar lección
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-black text-blue-400 hover:bg-blue-500/20 transition-all uppercase tracking-widest mt-2"
              >
                ✓ Guardar módulo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminModulesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [addingMod, setAddingMod] = useState(false);
  const [newModTitle, setNewModTitle] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch(`/api/instructor/courses/${courseId}`)
      .then(r => r.json())
      .then(d => {
        setCourse(d);
        setModules(d.modules ?? []);
      });
  }, [courseId]);

  const addModule = async () => {
    if (!newModTitle.trim()) return;
    const res = await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, title: newModTitle }),
    });
    const mod = await res.json();
    if (res.ok) {
      setModules(prev => [...prev, { ...mod, lessons: [] }]);
      setNewModTitle('');
      setAddingMod(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const deleteModule = async (modId: string) => {
    if (!confirm('¿Eliminar este módulo y todas sus lecciones?')) return;
    await fetch(`/api/modules/${modId}`, { method: 'DELETE' });
    setModules(prev => prev.filter(m => m.id !== modId));
  };

  const handleLessonAdd = (modId: string, lesson: any) =>
    setModules(prev => prev.map(m => m.id === modId ? { ...m, lessons: [...(m.lessons ?? []), lesson] } : m));

  const handleLessonUpdate = (modId: string, updated: any) =>
    setModules(prev => prev.map(m => m.id === modId ? { ...m, lessons: m.lessons.map((l: any) => l.id === updated.id ? updated : l) } : m));

  const handleLessonDelete = (modId: string, lessonId: string) =>
    setModules(prev => prev.map(m => m.id === modId ? { ...m, lessons: m.lessons.filter((l: any) => l.id !== lessonId) } : m));

  const handleTitleChange = (modId: string, title: string) =>
    setModules(prev => prev.map(m => m.id === modId ? { ...m, title } : m));

  if (!course) return <div className="text-gray-400 py-20 text-center animate-pulse">Cargando...</div>;

  return (
    <>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <Link href={`/dashboard/admin/courses/${courseId}`} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 mb-3">
            ← {course.title}
          </Link>
          <h1 className="text-2xl font-space-grotesk font-bold">Editor de módulos 📦</h1>
          <p className="text-gray-400 text-sm mt-1">{modules.length} módulo{modules.length !== 1 ? 's' : ''} · {modules.reduce((a, m) => a + (m.lessons?.length ?? 0), 0)} lecciones</p>
        </div>
        <Link href={`/dashboard/admin/courses/${courseId}/quiz`} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-purple-400 text-xs font-bold transition-colors">
          Ir a Evaluación →
        </Link>
      </div>

      <div className="space-y-0">
        {modules.map(mod => (
          <ModuleBlock
            key={mod.id}
            mod={mod}
            courseId={courseId}
            onDelete={deleteModule}
            onLessonAdd={handleLessonAdd}
            onLessonUpdate={handleLessonUpdate}
            onLessonDelete={handleLessonDelete}
            onTitleChange={handleTitleChange}
          />
        ))}
      </div>

      {addingMod ? (
        <div className="flex gap-2 mt-2">
          <input
            value={newModTitle}
            onChange={e => setNewModTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addModule()}
            placeholder="Título del módulo..."
            autoFocus
            className="flex-1 bg-[#0d1524] border border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-gray-600"
          />
          <button onClick={addModule} className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">Agregar</button>
          <button onClick={() => { setAddingMod(false); setNewModTitle(''); }} className="px-4 text-gray-400 hover:text-white text-sm">✕</button>
        </div>
      ) : (
          <button
            onClick={() => setAddingMod(true)}
            className="w-full mt-2 border-2 border-dashed border-blue-500/20 hover:border-cyan-500/40 rounded-2xl py-4 text-sm text-gray-500 hover:text-cyan-400 transition-all"
          >
            + Agregar módulo
          </button>
        )}

        <div className="mt-12 pt-10 border-t border-blue-500/10 flex justify-center">
           <button 
             onClick={() => {
               setShowToast(true);
               setTimeout(() => setShowToast(false), 3000);
             }}
             className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] rounded-2xl text-sm font-black text-white shadow-xl shadow-blue-500/20 transition-all uppercase tracking-[0.2em]"
           >
              Guardar cambios
           </button>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-10 right-10 z-[9999] animate-bounce-in">
            <div className="bg-[#0d1524] border border-cyan-500/30 rounded-2xl px-6 py-4 shadow-2xl shadow-cyan-500/20 flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <span className="text-cyan-400">✓</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">Cambios guardados</div>
                <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Sincronización exitosa</div>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes bounceIn {
            0% { transform: translateY(20px) scale(0.9); opacity: 0; }
            50% { transform: translateY(-5px) scale(1.02); opacity: 1; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          .animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        `}</style>
    </>
  );
}
