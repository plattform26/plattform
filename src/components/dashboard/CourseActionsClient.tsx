'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CourseActionsProps {
  courseId: string;
  status: string;
  enrollmentCount: number;
  role: 'ADMIN' | 'INSTRUCTOR';
}

export default function CourseActionsClient({ courseId, status, enrollmentCount, role }: CourseActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const router = useRouter();

  const isLocked = role === 'INSTRUCTOR' && (status === 'PUBLISHED' || status === 'HIBERNATED') && enrollmentCount > 0;

  const handleAction = async (action: 'hibernate' | 'duplicate' | 'delete' | 'publish') => {
    if (loading) return;
    
    if (action === 'delete') {
      // Bloqueo de eliminación solo para Instructores
      if (role === 'INSTRUCTOR' && enrollmentCount > 0) {
        alert('No se puede eliminar un curso con alumnos activos.');
        return;
      }
      if (!confirm('¿Estás seguro de eliminar este curso? Esta acción es irreversible.')) return;
    }

    setLoading(true);
    try {
      let url = `/api/instructor/courses/${courseId}`;
      let method = 'PATCH';
      let body: any = {};

      if (action === 'hibernate') body.status = 'HIBERNATED';
      if (action === 'publish') body.status = 'PUBLISHED';
      if (action === 'duplicate') {
        url = `/api/instructor/courses/${courseId}/duplicate`;
        method = 'POST';
      }
      if (action === 'delete') {
        method = 'DELETE';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' && method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      if (res.ok) {
        if (action === 'duplicate') {
          const newCourse = await res.json();
          router.push(`/dashboard/instructor/courses/${newCourse.id}/modules`);
        } else {
          router.refresh();
        }
      } else {
        const err = await res.json();
        alert(err.message || 'Error al procesar la acción');
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-end flex-wrap">
      {/* Botón Vista Previa - Siempre disponible */}
      <Link
        href={`/dashboard/student/learn/${courseId}?preview=true`}
        target="_blank"
        className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 rounded-lg text-[10px] font-black transition-all text-green-400 uppercase tracking-widest"
      >
        👁️ Vista Previa
      </Link>

      {/* Botón Constructor - Con Lógica de Bloqueo */}
      {isLocked ? (
        <button
          onClick={() => setShowLockModal(true)}
          className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[10px] font-black transition-all text-gray-500 uppercase tracking-widest flex items-center gap-1.5 opacity-60 cursor-not-allowed"
        >
          🔒 CONSTRUCTOR
        </button>
      ) : (
        <Link
          href={`/dashboard/instructor/courses/${courseId}/modules`}
          className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-[10px] font-black transition-all text-cyan-400 uppercase tracking-widest"
        >
          CONSTRUCTOR 🛠️
        </Link>
      )}

      {/* Acciones de Ciclo de Vida */}
      <div className="h-4 w-px bg-white/10 mx-1" />

      {status === 'PUBLISHED' ? (
        <button
          onClick={() => handleAction('hibernate')}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-400/80 transition-all uppercase"
          title="Hibernar: Ocultar del catálogo pero mantener acceso a alumnos"
        >
          ❄️ Hibernar
        </button>
      ) : status === 'HIBERNATED' ? (
        <button
          onClick={() => handleAction('publish')}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-green-500/20 hover:bg-green-500/10 text-green-400/80 transition-all uppercase"
        >
          🚀 Publicar
        </button>
      ) : null}

      <button
        onClick={() => handleAction('duplicate')}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-blue-500/20 hover:bg-blue-500/10 text-blue-400/80 transition-all uppercase"
      >
        📑 Duplicar
      </button>

      {(enrollmentCount === 0 || role === 'ADMIN') && (
        <button
          onClick={() => handleAction('delete')}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-500/20 hover:bg-red-500/10 text-red-400/80 transition-all uppercase"
        >
          🗑️ Eliminar
        </button>
      )}

      {/* Modal de Bloqueo */}
      {showLockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0d1524] border border-blue-500/20 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowLockModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >✕</button>
            <div className="text-4xl mb-6">🔒</div>
            <h3 className="text-xl font-space-grotesk font-bold text-white mb-4">Edición Bio-Protegida</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Este curso tiene <span className="text-cyan-400 font-bold">{enrollmentCount} alumnos activos</span> y no puede ser editado para proteger la experiencia del cliente.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8 text-xs text-blue-300">
              Si necesitas hacer cambios urgentes, utiliza la función <span className="font-bold text-white">"Duplicar"</span> para crear una nueva versión editable (DRAFT).
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowLockModal(false); handleAction('duplicate'); }}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-sm font-black text-white hover:opacity-90 transition-all uppercase tracking-widest"
              >
                📑 Duplicar Ahora
              </button>
              <button 
                onClick={() => setShowLockModal(false)}
                className="w-full py-4 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
