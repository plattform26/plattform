'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['BUSINESS', 'TECHNOLOGY', 'MARKETING', 'FINANCE', 'LEADERSHIP', 'DESIGN', 'OTHER'];
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const CAT_LABELS: Record<string, string> = {
  BUSINESS: 'Negocios', TECHNOLOGY: 'Tecnología', MARKETING: 'Marketing',
  FINANCE: 'Finanzas', LEADERSHIP: 'Liderazgo', DESIGN: 'Diseño', OTHER: 'Otro'
};
const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Principiante', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado'
};

export default function NewCourseClient({ aiEnabled, instructors = [] }: { aiEnabled: boolean, instructors?: {id: string, name: string}[] }) {
  const router = useRouter();
  const isAdmin = instructors.length > 0;
  
  // Si tiene IA, empezamos en modo 'selection'. Si no, directo al 'manual' build.
  const [view, setView] = useState<'selection' | 'manual'>(aiEnabled ? 'selection' : 'manual');

  const [form, setForm] = useState({
    title: '', description: '', price: '', durationHours: '',
    category: 'BUSINESS', level: 'BEGINNER',
    instructorId: isAdmin ? '' : undefined
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      setError('Título y precio son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          price: Number(form.price), 
          durationHours: Number(form.durationHours || 0),
          instructorId: form.instructorId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el curso');
      router.push(`/dashboard/instructor/courses/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (view === 'selection') {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-space-grotesk font-bold mb-3">¿Cómo deseas crear tu curso?</h1>
          <p className="text-gray-400">Tu plan incluye créditos de IA para acelerar tu diseño instruccional.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Link href="/dashboard/instructor/courses/new/ai" className="group bg-gradient-to-br from-[#152035] to-[#0a1f44] border border-cyan-500/30 p-8 rounded-3xl hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all flex flex-col items-center text-center cursor-pointer">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">✨</div>
              <h3 className="text-xl font-bold mb-3 text-cyan-400">Crear con IA</h3>
              <p className="text-gray-400 text-sm mb-8">Genera la estructura, módulos, lecciones y un primer quiz en segundos describiendo tu idea.</p>
              <div className="mt-auto px-6 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold group-hover:bg-cyan-500 group-hover:text-black transition-colors w-full border border-cyan-500/30">Usar Generador IA →</div>
           </Link>
           
           <div onClick={() => setView('manual')} className="group bg-[#0d1524] border border-blue-500/20 p-8 rounded-3xl hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all flex flex-col items-center text-center cursor-pointer">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">✍️</div>
              <h3 className="text-xl font-bold mb-3">Crear manualmente</h3>
              <p className="text-gray-400 text-sm mb-8">Configura tu curso desde cero, escribe tus propias lecciones y ajusta todo a tu propio ritmo.</p>
              <div className="mt-auto px-6 py-2 rounded-xl bg-blue-500/10 text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors w-full border border-blue-500/20">Modo Manual →</div>
           </div>
        </div>
      </div>
    );
  }

  // Vista Manual
  return (
    <>
      <div className="mb-6">
        <button onClick={() => aiEnabled ? setView('selection') : router.push('/dashboard/instructor/courses')} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 mb-4">
          ← {aiEnabled ? 'Volver al selector' : 'Regresar a mis cursos'}
        </button>
        <h1 className="text-2xl font-space-grotesk font-bold">Crear nuevo curso ✍️</h1>
        <p className="text-gray-400 text-sm mt-1">Define los datos básicos de tu curso. Después agregas módulos y lecciones.</p>
        
        {!aiEnabled && (
          <div className="mt-4 p-4 border border-blue-500/30 bg-[#152035] rounded-xl flex items-center justify-between">
            <div>
               <p className="text-sm font-semibold text-cyan-400">Acelera la creación de tus cursos con Inteligencia Artificial ✨</p>
               <p className="text-xs text-gray-400">Actualiza a Scale para usar la IA y generar módulos, lecciones y quizzes automáticamente en segundos.</p>
            </div>
            <Link href="/dashboard/instructor/plan" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap ml-4">Hacer Upgrade</Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
         <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl p-6 space-y-5">
           {error && (
             <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
               {error}
             </div>
           )}

           {isAdmin && (
             <div>
               <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Asignar Instructor *</label>
               <select
                 value={form.instructorId}
                 onChange={e => setForm({ ...form, instructorId: e.target.value })}
                 required
                 className="w-full bg-[#070d1a] border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
               >
                 <option value="">Seleccione Instructor...</option>
                 {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
               </select>
             </div>
           )}

           <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Título del curso *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Finanzas Personales desde Cero"
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción del curso</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="¿Qué aprenderán tus alumnos? ¿A quién va dirigido este curso?"
              rows={4}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Precio (MXN) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="999"
                min="0"
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Duración (horas)</label>
              <input
                type="number"
                value={form.durationHours}
                onChange={e => setForm({ ...form, durationHours: e.target.value })}
                placeholder="10"
                min="0"
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nivel</label>
              <select
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Link href="/dashboard/instructor/courses" className="px-5 py-2.5 border border-blue-500/20 rounded-xl text-sm text-gray-400 hover:text-white hover:border-blue-500/40 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform disabled:opacity-60 disabled:scale-100"
          >
            {saving ? 'Creando...' : 'Crear curso →'}
          </button>
        </div>
      </form>
    </>
  );
}
