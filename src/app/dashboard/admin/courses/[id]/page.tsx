'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['BUSINESS','TECHNOLOGY','MARKETING','FINANCE','LEADERSHIP','DESIGN','OTHER'];
const LEVELS = ['BEGINNER','INTERMEDIATE','ADVANCED'];
const STATUS_OPTIONS = ['DRAFT','PUBLISHED','HIBERNATED'];
const CAT_LABELS: Record<string,string> = {
  BUSINESS:'Negocios',TECHNOLOGY:'Tecnología',MARKETING:'Marketing',
  FINANCE:'Finanzas',LEADERSHIP:'Liderazgo',DESIGN:'Diseño',OTHER:'Otro'
};
const LEVEL_LABELS: Record<string,string> = {
  BEGINNER:'Principiante',INTERMEDIATE:'Intermedio',ADVANCED:'Avanzado'
};
const STATUS_LABELS: Record<string,string> = {
  DRAFT:'Borrador',PUBLISHED:'Publicado',HIBERNATED:'Hibernado'
};

export default function AdminEditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/instructor/courses/${id}`)
      .then(r => r.json())
      .then(d => {
        setCourse(d);
        setForm({
          title: d.title,
          description: d.description,
          price: d.price,
          durationHours: d.durationHours ?? 0,
          category: d.category,
          level: d.level,
          thumbnailUrl: d.thumbnailUrl ?? '',
          previewText: d.previewText ?? '',
          visibility: d.visibility,
        });
      });
  }, [id]);

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/instructor/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCourse(data);
      showMsg('ok', 'Cambios guardados ✓');
    } catch (err: any) {
      showMsg('err', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showMsg('err', 'El archivo supera los 5MB permitidos');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, thumbnailUrl: reader.result as string });
      showMsg('ok', 'Imagen cargada localmente (base64) ✓');
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/instructor/courses/${id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCourse({ ...course, status: 'PUBLISHED' });
      showMsg('ok', '🎉 Curso publicado exitosamente');
    } catch (err: any) {
      showMsg('err', err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleHibernate = async () => {
    if (!confirm('¿Hibernar este curso? Los nuevos alumnos no podrán inscribirse.')) return;
    const res = await fetch(`/api/instructor/courses/${id}/hibernate`, { method: 'POST' });
    if (res.ok) {
      setCourse({ ...course, status: 'HIBERNATED' });
      showMsg('ok', 'Curso hibernado');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    const res = await fetch(`/api/instructor/courses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard/admin/courses');
    } else {
      showMsg('err', 'Error al eliminar');
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    const res = await fetch(`/api/instructor/courses/${id}/duplicate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showMsg('ok', 'Curso duplicado ✓');
      setTimeout(() => router.push(`/dashboard/admin/courses/${data.id}`), 1000);
    } else {
      showMsg('err', data.error);
    }
  };

  const handleFinalize = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/instructor/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/student/learn/${id}`);
    } catch (err: any) {
      showMsg('err', err.message);
      setSaving(false);
    }
  };

  if (!course) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse">Cargando curso...</div>
    </div>
  );

  const statusColor: Record<string, string> = {
    PUBLISHED: 'text-green-400',
    DRAFT: 'text-gray-400',
    HIBERNATED: 'text-yellow-400',
  };

  return (
    <>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <Link href="/dashboard/admin/courses" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 mb-3">
            ← Gestión de Cursos
          </Link>
          <h1 className="text-2xl font-space-grotesk font-bold">{course.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold uppercase ${statusColor[course.status] ?? 'text-gray-400'}`}>
              ● {STATUS_LABELS[course.status] ?? course.status}
            </span>
            <span className="text-gray-600 text-xs">Creado {new Date(course.createdAt).toLocaleDateString('es-MX')}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {course.status !== 'PUBLISHED' && (
            <button onClick={handlePublish} disabled={publishing} className="px-4 py-2 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 rounded-xl text-green-400 text-xs font-bold transition-colors disabled:opacity-60">
              {publishing ? '...' : '🚀 Publicar'}
            </button>
          )}
          {course.status === 'PUBLISHED' && (
            <button onClick={handleHibernate} className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 rounded-xl text-yellow-400 text-xs font-bold transition-colors">
              💤 Hibernar
            </button>
          )}
          <button onClick={handleDuplicate} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-xl text-gray-300 text-xs font-bold transition-colors">
            📋 Duplicar
          </button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-red-400 text-xs font-bold transition-colors disabled:opacity-60">
            🗑 Eliminar
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${msg.type === 'ok' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {/* Quick nav */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link href={`/dashboard/admin/courses/${id}/modules`} className="flex-1 min-w-[150px] bg-[#0d1524] border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl p-4 text-center transition-colors group">
          <div className="text-2xl mb-1">📦</div>
          <div className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">Editor de módulos</div>
          <div className="text-xs text-gray-500 mt-0.5">{course.modules?.length ?? 0} módulos</div>
        </Link>
        <Link href={`/dashboard/admin/courses/${id}/quiz`} className="flex-1 min-w-[150px] bg-[#0d1524] border border-purple-500/20 hover:border-purple-500/40 rounded-xl p-4 text-center transition-colors group">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-sm font-semibold text-purple-400 group-hover:text-purple-300">Constructor de evaluación</div>
          <div className="text-xs text-gray-500 mt-0.5">{course.quizzes?.length ?? 0} evaluaciones</div>
        </Link>
      </div>

      <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Título *</label>
          <input
            value={form.title || ''}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción del curso</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="¿Qué aprenderán tus alumnos? ¿A quién va dirigido este curso?"
            rows={4}
            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            Lección de muestra gratuita
            <span className="group relative">
                <span className="cursor-help text-cyan-500">ⓘ</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[10px] text-gray-300 invisible group-hover:visible shadow-2xl">
                    Este texto se mostrará como introducción gratuita para visitantes sin cuenta.
                </span>
            </span>
          </label>
          <textarea
            value={form.previewText || ''}
            onChange={e => setForm({ ...form, previewText: e.target.value })}
            rows={2}
            placeholder="Un resumen estratégico que invite a la compra..."
            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder-gray-600"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Imagen de portada (PNG/JPG/WEBP - Máx 5MB)</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-20 bg-[#070d1a] border border-blue-500/20 rounded-xl overflow-hidden flex items-center justify-center relative group">
                {form.thumbnailUrl ? (
                  <img src={form.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-20">🖼️</span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => setForm({...form, thumbnailUrl: ''})} className="text-[10px] text-red-400 font-bold uppercase">Eliminar</button>
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="course-thumbnail-upload"
                />
                <label 
                  htmlFor="course-thumbnail-upload"
                  className="inline-block px-4 py-2 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-lg text-xs font-bold text-cyan-400 cursor-pointer transition-colors"
                >
                  {form.thumbnailUrl ? 'Cambiar imagen' : 'Subir imagen'}
                </label>
                <p className="text-[10px] text-gray-600 mt-2 italic">Opcional. Si no subes una imagen, se usará un placeholder premium.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Precio (MXN)</label>
            <input
              type="number"
              value={form.price || 0}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Duración (horas)</label>
            <input
              type="number"
              value={form.durationHours || 0}
              onChange={e => setForm({ ...form, durationHours: e.target.value })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categoría</label>
            <select value={form.category || 'BUSINESS'} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nivel</label>
            <select value={form.level || 'BEGINNER'} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors">
              {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-blue-500/10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#0d1524] border border-blue-500/20 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:border-blue-500/40 transition-all disabled:opacity-60"
          >
            {saving ? '...' : 'Guardar cambios'}
          </button>
          
          <button
            onClick={handleFinalize}
            disabled={saving}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider"
          >
            {saving ? 'Guardando...' : 'Finalizar y ver curso →'}
          </button>
        </div>
      </div>
    </>
  );
}
