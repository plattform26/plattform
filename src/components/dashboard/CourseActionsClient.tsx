'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UpgradePlanModal from './UpgradePlanModal';

interface CourseActionsProps {
  courseId: string;
  status: string;
  enrollmentCount: number;
  role: 'ADMIN' | 'INSTRUCTOR';
  planName?: string;
  isCourtesy?: boolean;
  instructorStatus?: string;
}

export default function CourseActionsClient({ 
  courseId, 
  status, 
  enrollmentCount, 
  role, 
  planName, 
  isCourtesy,
  instructorStatus 
}: CourseActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();

  // Misión: Lógica de Bloqueo por Mantenimiento (Alumnos activos)
  const isEditingLocked = role === 'INSTRUCTOR' && (status === 'PUBLISHED' || status === 'HIBERNATED') && enrollmentCount > 0;
  
  // Misión: Soft-Lock por Suscripción (SIN PLAN)
  // Admins son inmunes.
  const isSoftLocked = role === 'INSTRUCTOR' && !isCourtesy && (!planName || planName === 'SIN PLAN' || planName === 'STARTER');
  
  // Restricción por suscripción: Solo Scale puede duplicar. Admins siempre pueden.
  const isDuplicationRestricted = role === 'INSTRUCTOR' && planName?.toLowerCase() !== 'scale';

  const handleAction = async (action: 'hibernate' | 'duplicate' | 'delete' | 'publish') => {
    if (loading || isSoftLocked) return;
    
    if (action === 'publish' && instructorStatus !== 'ACTIVE') {
      alert('🔒 Acción bloqueada: Tu cuenta requiere aprobación administrativa para publicar cursos.');
      return;
    }

    if (action === 'duplicate' && isDuplicationRestricted) {
      setShowUpgradeModal(true);
      return;
    }

    if (action === 'delete') {
      // Bloqueo total de eliminación para Instructores (Misión: Admin Role Armor v8.3)
      if (role !== 'ADMIN') {
        alert('🔒 Acción prohibida: Solo los administradores de la plataforma pueden eliminar cursos físicos.');
        return;
      }
      if (!confirm('🛑 ATENCIÓN: Esta es una ELIMINACIÓN FÍSICA PERMANENTE. Se borrarán alumnos, módulos y progreso. ¿Confirmar destrucción total?')) return;
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
          const redirectRole = role.toLowerCase();
          router.push(`/dashboard/${redirectRole}/courses/${newCourse.id}/modules`);
        } else {
          router.refresh();
        }
      } else {
        const err = await res.json();
        alert(err.error || err.message || 'Error al procesar la acción');
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
        href={`/dashboard/instructor/courses/${courseId}/preview`}
        target="_blank"
        className="flex-1 px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold text-center hover:bg-cyan-500/20 transition-all text-xs uppercase tracking-widest"
      >
        👁️ Vista Previa
      </Link>

      {/* Botón Constructor - Con Lógica de Bloqueo y Tooltip Informativo */}
      <div className="relative group">
        {isSoftLocked ? (
          <div className="relative group/soft-lock">
            <button
               disabled
               className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-[10px] font-black text-gray-500 opacity-60 cursor-not-allowed uppercase tracking-widest"
            >
               🔒 CONSTRUCTOR
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[9px] text-red-400 font-bold text-center opacity-0 group-hover/soft-lock:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
               Requiere plan activo para editar.
            </div>
          </div>
        ) : isEditingLocked ? (
          <>
            <button
              onClick={() => setShowLockModal(true)}
              className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[10px] font-black transition-all text-gray-500 uppercase tracking-widest flex items-center gap-1.5 opacity-60 hover:opacity-100 group-hover:bg-blue-500/10 group-hover:border-blue-500/20"
            >
              🔒 CONSTRUCTOR
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-black/95 border border-white/10 rounded-xl text-[9px] text-blue-300 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl backdrop-blur-sm">
                No se puede editar el curso dado que está en producción y con alumnos activos. 
                Para realizar cambios estructurales, <span className="text-white font-bold">duplica el curso</span> (requiere Plan Scale) o contacta a soporte.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/95"></div>
            </div>
          </>
        ) : (
          <Link
            href={`/dashboard/instructor/courses/${courseId}/modules`}
            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-[10px] font-black transition-all text-cyan-400 uppercase tracking-widest"
          >
            CONSTRUCTOR 🛠️
          </Link>
        )}
      </div>

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
      ) : status === 'HIBERNATED' || status === 'DRAFT' ? (
        <div className="relative group">
          <button
            onClick={() => handleAction('publish')}
            disabled={loading || instructorStatus === 'PENDING_APPROVAL'}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all uppercase flex items-center gap-1.5 ${
                instructorStatus === 'PENDING_APPROVAL'
                ? 'border-gray-500/20 bg-gray-500/5 text-gray-500 cursor-not-allowed opacity-50'
                : 'border-green-500/20 hover:bg-green-500/10 text-green-400/80'
            }`}
          >
            {instructorStatus === 'PENDING_APPROVAL' && <span>🔒</span>}
            🚀 Publicar
          </button>
          
          {instructorStatus === 'PENDING_APPROVAL' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/95 border border-white/10 rounded-xl text-[9px] text-yellow-400 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                Disponible tras la aprobación del administrador
            </div>
          )}
        </div>
      ) : null}

      {/* Botón Duplicar con Restricción Visual */}
      <div className="relative group">
        <button
          onClick={() => handleAction('duplicate')}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all uppercase flex items-center gap-1.5 ${
            isDuplicationRestricted 
              ? 'border-gray-500/20 bg-gray-500/5 text-gray-500 hover:bg-gray-500/10' 
              : 'border-blue-500/20 hover:bg-blue-500/10 text-blue-400/80'
          }`}
        >
          {isDuplicationRestricted && <span>🔒</span>}
          📑 Duplicar
        </button>
        
        {isDuplicationRestricted && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-white/10 rounded text-[9px] text-cyan-400 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
             Función exclusiva del Plan Scale
          </div>
        )}
      </div>

      {role === 'ADMIN' && (
        <button
          onClick={() => handleAction('delete')}
          disabled={loading || isSoftLocked}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all uppercase ${
             isSoftLocked
             ? 'border-gray-500/20 bg-gray-500/5 text-gray-700 cursor-not-allowed grayscale'
             : 'border-red-500/20 hover:bg-red-500/10 text-red-500 font-black shadow-lg shadow-red-500/10'
          }`}
        >
          🗑️ Eliminar
        </button>
      )}

      {/* Upgrade Modal */}
      <UpgradePlanModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        featureName="Duplicación Masiva"
      />

      {/* Modal de Bloqueo de Edición */}
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
