'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';

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
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
           const data = await res.json();
           setUserRole(data.role || null);
        }
      } catch (err) {
        console.error('Error fetching user for role check:', err);
      }
    };
    fetchUser();
  }, []);

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
    
    fetchStudents();
  }, [id]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}/students`);
      if (res.ok) setStudents(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    const toastId = toast.loading('Guardando cambios...');
    try {
      const res = await fetch(`/api/instructor/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCourse(data);
      toast.success('Cambios guardados ✓', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
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

  const handleAdminHardDeleteCourse = async () => {
    if (!confirm('🛑 ATENCIÓN: Esta es una ELIMINACIÓN FÍSICA PERMANENTE. Se borrarán módulos, lecciones, exámenes y progreso de todos los alumnos. ¿Confirmar destrucción total?')) return;
    setDeleting(true);
    const toastId = toast.loading('Ejecutando limpieza total...');
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message, { id: toastId });
      router.push('/dashboard/admin/courses');
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
      setDeleting(false);
    }
  };

  const handleDeleteEnrollment = async (studentId: string, studentEmail: string) => {
    if (!confirm(`¿Eliminar la inscripción de "${studentEmail}" de este curso? El alumno perderá acceso y su progreso será eliminado.`)) return;
    
    const toastId = toast.loading('Eliminando acceso...');
    try {
      const res = await fetch(`/api/admin/courses/${id}/students?userId=${studentId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Inscripción eliminada ✓', { id: toastId });
        fetchStudents();
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDuplicate = async () => {
    const toastId = toast.loading('Duplicando curso...');
    const res = await fetch(`/api/instructor/courses/${id}/duplicate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      toast.success('Curso duplicado ✓', { id: toastId });
      setTimeout(() => router.push(`/dashboard/admin/courses/${data.id}/modules`), 1000);
    } else {
      toast.error(data.error, { id: toastId });
    }
  };

  const handleFinalize = async () => {
    if (!validateForm()) return;
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
      toast.error(err.message);
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
      <Toaster richColors position="top-right" />
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
          
          {userRole === 'ADMIN' && (
            <button onClick={handleAdminHardDeleteCourse} disabled={deleting} className="px-4 py-2 bg-red-500 shadow-xl shadow-red-500/20 rounded-xl text-white text-xs font-black transition-all disabled:opacity-60 uppercase tracking-widest">
              🗑 Eliminar Permanentemente
            </button>
          )}
        </div>
      </div>


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
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title || ''}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            Descripción del curso <span className="text-red-500">*</span>
          </label>
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
            Lección de muestra gratuita <span className="text-red-500">*</span>
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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Precio (MXN) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.price || 0}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Duración (horas) <span className="text-red-500">*</span>
            </label>
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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select value={form.category || 'BUSINESS'} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Nivel <span className="text-red-500">*</span>
            </label>
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

      {/* SECCIÓN DE ALUMNOS INSCRITOS */}
      <div className="mt-12 bg-[#0d1524] border border-blue-500/10 rounded-[32px] overflow-hidden shadow-2xl animate-fade-in text-left">
        <div className="p-8 border-b border-blue-500/10 flex items-center justify-between bg-blue-500/5">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Alumnos Inscritos</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Control Maestro de Accesos</p>
          </div>
          <span className="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-xs font-black">{students.length} Total</span>
        </div>
        
        <div className="p-0">
          {loadingStudents ? (
            <div className="p-20 text-center text-gray-600 animate-pulse font-bold uppercase text-[10px] tracking-widest">
              Consultando base de alumnos...
            </div>
          ) : students.length === 0 ? (
            <div className="p-20 text-center border-b border-blue-500/10">
               <p className="text-gray-600 italic">No hay alumnos inscritos en este curso todavía.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-blue-500/10 text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                    <th className="px-8 py-4">Alumno</th>
                    <th className="px-8 py-4">Email</th>
                    <th className="px-8 py-4">Inscrito el</th>
                    <th className="px-8 py-4">Último Acceso</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/5">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-200">{s.name} {s.lastName}</div>
                      </td>
                      <td className="px-8 py-4 text-gray-400 text-sm">{s.email}</td>
                      <td className="px-8 py-4 text-gray-500 text-sm">{new Date(s.enrolledAt).toLocaleDateString()}</td>
                      <td className="px-8 py-4 text-gray-500 text-sm">{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : 'Nunca'}</td>
                      <td className="px-8 py-4 text-right">
                        {userRole === 'ADMIN' && (
                          <button 
                            title="Eliminar inscripción física"
                            onClick={() => handleDeleteEnrollment(s.id, s.email)}
                            className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all transform active:scale-95 shadow-lg shadow-red-500/20 ml-auto"
                          >
                            <span className="font-bold text-lg leading-none">×</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
