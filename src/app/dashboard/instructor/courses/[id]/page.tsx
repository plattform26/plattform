'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import UpgradePlanModal from '@/components/dashboard/UpgradePlanModal';
import { sanitizePayload } from '@/lib/utils/sanitize';

const CATEGORIES = [
  'STRATEGY_BUSINESS',
  'TECH_INNOVATION',
  'DESIGN_MEDIA',
  'DIGITAL_MARKETING',
  'INVESTMENT_FINTECH',
  'HIGH_PERFORMANCE',
  'BIOHACKING_HEALTH',
  'ACADEMIC_LEADERSHIP'
];
const LEVELS = ['BEGINNER','INTERMEDIATE','ADVANCED'];
const STATUS_OPTIONS = ['DRAFT','PUBLISHED','HIBERNATED'];
const CAT_LABELS: Record<string,string> = {
  STRATEGY_BUSINESS: 'Estrategia y Negocios',
  TECH_INNOVATION: 'Tecnología e Innovación',
  DESIGN_MEDIA: 'Diseño y Media',
  DIGITAL_MARKETING: 'Marketing Digital',
  INVESTMENT_FINTECH: 'Inversión y Fintech',
  HIGH_PERFORMANCE: 'Alto Rendimiento',
  BIOHACKING_HEALTH: 'Biohacking y Salud',
  ACADEMIC_LEADERSHIP: 'Liderazgo Académico'
};
const OTHER_CAT_FALLBACK = 'STRATEGY_BUSINESS'; // Fallback for legacy categories

const LEVEL_LABELS: Record<string,string> = {
  BEGINNER:'Principiante',INTERMEDIATE:'Intermedio',ADVANCED:'Avanzado'
};
const STATUS_LABELS: Record<string,string> = {
  DRAFT:'Borrador',PUBLISHED:'Publicado',HIBERNATED:'Hibernado'
};

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'INSTRUCTOR' | null>(null);
  const [activePlanName, setActivePlanName] = useState<string>('');

  // Misión: Validación de Claridad Total
  const validateForm = () => {
    const missingFields: string[] = [];
    if (!form.title?.trim()) missingFields.push('Título');
    if (!form.description?.trim()) missingFields.push('Descripción');
    if (!form.previewText?.trim()) missingFields.push('Lección de muestra');
    if (!form.price || parseFloat(form.price) <= 0) missingFields.push('Precio');
    if (!form.durationHours || parseInt(form.durationHours) <= 0) missingFields.push('Duración');
    if (!form.category) missingFields.push('Categoría');
    if (!form.level) missingFields.push('Nivel');

    if (missingFields.length > 0) {
      toast.error('No se puede guardar: Faltan datos esenciales', {
        description: `Por favor completa los siguientes campos: [${missingFields.join(', ')}].`,
        duration: 5000,
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Fetch session for role
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(s => {
        setRole(s.role);
        setActivePlanName(s.activePlanName || '');
      });

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
          thumbnailUrl: d.thumbnailUrl ?? null,
          previewText: d.previewText ?? null,
          visibility: d.visibility,
        });
      });
  }, [id]);

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    const toastId = toast.loading('Guardando cambios...');
    try {
      const res = await fetch(`/api/instructor/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizePayload(form)),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Misión: Error inteligente en Toast
        if (res.status === 400 && data.details) {
          const errors = data.details;
          const firstErrorKey = Object.keys(errors)[0];
          const errorMsg = errors[firstErrorKey]?._errors?.[0] || 'Dato inválido';
          throw new Error(`Error en ${firstErrorKey}: ${errorMsg}`);
        }
        throw new Error(data.error || 'Error al guardar');
      }

      setCourse(data);
      toast.success('Cambios guardados ✓', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { 
        id: toastId,
        description: 'Revisa que todos los campos cumplan con el formato requerido.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Misión: Validación de 2MB de Alto Impacto
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Error: La imagen excede el límite de 2MB. Por favor, optimiza el archivo antes de subirlo.', {
        duration: 5000,
        description: 'Intenta usar herramientas como TinyPNG o reducir las dimensiones.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, thumbnailUrl: reader.result as string });
      toast.success('Imagen cargada localmente ✓');
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    setPublishing(true);
    const toastId = toast.loading('Publicando curso...');
    try {
      const res = await fetch(`/api/instructor/courses/${id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCourse({ ...course, status: 'PUBLISHED' });
      toast.success('🎉 Curso publicado exitosamente', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setPublishing(false);
    }
  };

  const handleHibernate = async () => {
    if (!confirm('¿Hibernar este curso? Los nuevos alumnos no podrán inscribirse.')) return;
    const res = await fetch(`/api/instructor/courses/${id}/hibernate`, { method: 'POST' });
    if (res.ok) {
      setCourse({ ...course, status: 'HIBERNATED' });
      toast.success('Curso hibernado');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    const res = await fetch(`/api/instructor/courses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Curso eliminado');
      router.push('/dashboard/instructor/courses');
    } else {
      toast.error('Error al eliminar');
      setDeleting(false);
    }
  };

  const isDuplicationRestricted = activePlanName.toLowerCase() !== 'scale' && role !== 'ADMIN';

  const handleDuplicate = async () => {
    if (isDuplicationRestricted) {
      setShowUpgradeModal(true);
      return;
    }
    const toastId = toast.loading('Duplicando curso...');
    const res = await fetch(`/api/instructor/courses/${id}/duplicate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      toast.success('Curso duplicado ✓', { id: toastId });
      setTimeout(() => router.push(`/dashboard/instructor/courses/${data.id}/modules`), 1000);
    } else {
      toast.error(data.error, { id: toastId });
    }
  };

  const handleFinalize = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      router.push(`/dashboard/instructor/courses`);
    } catch (err: any) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  const isLocked = role === 'INSTRUCTOR' && course?.status !== 'DRAFT' && (course?._count?.enrollments > 0);

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
          <Link href="/dashboard/instructor/courses" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 mb-3">
            ← Mis cursos
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
          
          <div className="relative group/dup">
            <button 
                onClick={handleDuplicate} 
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isDuplicationRestricted 
                    ? 'bg-gray-500/5 border-gray-500/20 text-gray-500 hover:bg-gray-500/10' 
                    : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-gray-300'
                }`}
            >
                {isDuplicationRestricted && <span>🔒</span>}
                📋 Duplicar
            </button>
            {isDuplicationRestricted && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 border border-cyan-500/30 rounded-lg text-[10px] text-cyan-400 font-bold whitespace-nowrap opacity-0 group-hover/dup:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                    Función exclusiva del Plan Scale
                </div>
            )}
          </div>

          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-red-400 text-xs font-bold transition-colors disabled:opacity-60">
            🗑 Eliminar
          </button>
        </div>
      </div>

      <UpgradePlanModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        featureName="Duplicación Masiva"
      />

      {/* BANNER DE ALERTA DINÁMICO (Misión: Relajar Restricciones) */}
      {isLocked ? (
        <div className="mb-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-3xl flex items-center gap-6 animate-in slide-in-from-top duration-300 shadow-2xl shadow-blue-500/5">
          <span className="text-4xl">🔒</span>
          <div className="flex-1">
            <h4 className="text-lg font-space-grotesk font-black text-white italic uppercase tracking-tighter">Seguridad de Producción Activa</h4>
            <p className="text-xs text-blue-300 font-medium mt-1">
              Este curso tiene <strong className="text-white">{course?._count?.enrollments} alumnos activos</strong>. La edición directa está bloqueada para garantizar la estabilidad del aprendizaje.
            </p>
          </div>
          <button 
            onClick={() => setShowLockModal(true)}
            className="text-[10px] font-black uppercase text-cyan-400 tracking-widest px-6 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl hover:bg-cyan-400/20 transition-all"
          >
            Saber más
          </button>
        </div>
      ) : (!form.title || !form.description) && course.status !== 'PUBLISHED' && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-300">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-yellow-400">Faltan datos críticos para publicar</h4>
            <p className="text-xs text-yellow-400/70 font-light">
              Debes configurar el <strong className="text-yellow-400">Título</strong> y la <strong className="text-yellow-400">Descripción</strong> del curso. 
              La imagen de portada ahora es opcional.
            </p>
          </div>
          <div className="text-[10px] font-black uppercase text-yellow-500/50 tracking-widest px-3 py-1 border border-yellow-500/20 rounded-lg">Faltante</div>
        </div>
      )}


      {/* Quick nav */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button 
          onClick={() => isLocked ? setShowLockModal(true) : router.push(`/dashboard/instructor/courses/${id}/modules`)} 
          className={`flex-1 min-w-[150px] bg-[#0d1524] border rounded-xl p-4 text-center transition-colors group ${isLocked ? 'border-gray-500/20 opacity-60' : 'border-cyan-500/20 hover:border-cyan-500/40'}`}
        >
          <div className="text-2xl mb-1">{isLocked ? '🔒' : '📦'}</div>
          <div className={`text-sm font-semibold transition-colors ${isLocked ? 'text-gray-500' : 'text-cyan-400 group-hover:text-cyan-300'}`}>Constructor de Módulos 🛠️</div>
          <div className="text-xs text-gray-500 mt-0.5">{course.modules?.length ?? 0} módulos</div>
        </button>
        <button 
          onClick={() => isLocked ? setShowLockModal(true) : router.push(`/dashboard/instructor/courses/${id}/quiz`)}
          className={`flex-1 min-w-[150px] bg-[#0d1524] border rounded-xl p-4 text-center transition-colors group ${isLocked ? 'border-gray-500/20 opacity-60' : 'border-purple-500/20 hover:border-purple-500/40'}`}
        >
          <div className="text-2xl mb-1">{isLocked ? '🔒' : '📝'}</div>
          <div className={`text-sm font-semibold transition-colors ${isLocked ? 'text-gray-500' : 'text-purple-400 group-hover:text-purple-300'}`}>Constructor de Evaluación 🛠️</div>
          <div className="text-xs text-gray-500 mt-0.5">{course.quizzes?.length ?? 0} evaluaciones</div>
        </button>
      </div>

      <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            disabled={isLocked}
            value={form.title || ''}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            Descripción del curso <span className="text-red-500">*</span>
          </label>
          <textarea
            disabled={isLocked}
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="¿Qué aprenderán tus alumnos? ¿A quién va dirigido este curso?"
            rows={4}
            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            Lección de muestra gratuita <span className="text-red-500">*</span>
            <span className="group relative">
                <span className="cursor-help text-cyan-500">ⓘ</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[10px] text-gray-300 invisible group-hover:visible shadow-2xl">
                    Este texto se mostrará como introducción gratuita para visitantes sin cuenta.
                </span>
            </span>
          </label>
          <textarea
            disabled={isLocked}
            value={form.previewText || ''}
            onChange={(e) => setForm({ ...form, previewText: e.target.value })}
            rows={2}
            placeholder="Un resumen estratégico que invite a la compra..."
            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder-gray-600 disabled:opacity-50"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 italic">Imagen de portada (PNG/JPG/WEBP - Máx 2MB - Opcional)</label>
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
                  disabled={isLocked}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="course-thumbnail-upload"
                />
                <label 
                  htmlFor={isLocked ? undefined : "course-thumbnail-upload"}
                  onClick={() => isLocked && setShowLockModal(true)}
                  className={`inline-block px-4 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${isLocked ? 'border-gray-500/20 bg-gray-500/5 text-gray-500' : 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400'}`}
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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Precio (MXN) <span className="text-red-500">*</span>
            </label>
            <input
              disabled={isLocked}
              type="number"
              value={form.price || 0}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Duración (horas) <span className="text-red-500">*</span>
            </label>
            <input
              disabled={isLocked}
              type="number"
              value={form.durationHours || 0}
              onChange={e => setForm({ ...form, durationHours: e.target.value })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select disabled={isLocked} value={form.category || 'BUSINESS'} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Nivel <span className="text-red-500">*</span>
            </label>
            <select disabled={isLocked} value={form.level || 'BEGINNER'} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50">
              {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
            </select>
          </div>
        </div>

        {/* Modal de Bloqueo Instructivo */}
        {showLockModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0b1221] border border-blue-500/30 rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl relative">
              <button 
                onClick={() => setShowLockModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white"
              >✕</button>
              <div className="text-4xl mb-6">🔒</div>
              <h3 className="text-2xl font-space-grotesk font-black text-white mb-4 italic uppercase tracking-tighter text-left">Curso Blindado</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light italic">
                La seguridad de producción está activa porque este curso ya tiene <span className="text-cyan-400 font-bold">{course._count.enrollments} alumnos inscritos</span>. 
                Para evitar inconsistencias en el progreso de tus alumnos, la edición estructural ha sido restringida.
                <br/><br/>
                <span className="text-white font-bold block mb-2">¿Cómo proceder?</span>
                1. <span className="text-cyan-400 font-bold">Duplica el curso</span> para trabajar en una nueva versión (Requiere Plan Scale).
                2. Contacta a <span className="text-blue-400 font-bold">Soporte Técnico</span> si necesitas un cambio de emergencia.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                   onClick={() => { setShowLockModal(false); handleDuplicate(); }}
                   className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-xs font-black text-white hover:scale-105 transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-widest"
                >
                  📑 Duplicar Curso Certificado
                </button>
                <button 
                  onClick={() => setShowLockModal(false)}
                  className="w-full py-4 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-blue-500/10">
          <button
            onClick={() => isLocked ? setShowLockModal(true) : handleSave()}
            disabled={saving}
            className={`px-6 py-2.5 bg-[#0d1524] border rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${isLocked ? 'border-gray-500/20 text-gray-500' : 'border-blue-500/20 text-gray-400 hover:text-white hover:border-blue-500/40'}`}
          >
            {saving ? '...' : (isLocked ? '🔒 Bloqueado' : 'Guardar cambios')}
          </button>
          
          <button
            onClick={() => isLocked ? setShowLockModal(true) : handleFinalize()}
            disabled={saving}
            className={`px-8 py-2.5 rounded-xl text-sm font-black text-white shadow-lg transition-all uppercase tracking-wider ${isLocked ? 'bg-gray-700/50 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {saving ? 'Guardando...' : 'Finalizar y volver a mis cursos →'}
          </button>
        </div>
      </div>
    </>
  );
}
