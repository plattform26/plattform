'use client';

import Link from 'next/link';

interface NewCourseButtonProps {
  status?: string;
  planName?: string;
  isCourtesy?: boolean;
  className?: string;
}

export default function NewCourseButton({ status, planName, isCourtesy, className }: NewCourseButtonProps) {
  const isActiveStatus = status === 'ACTIVE';
  
  // Bloqueo si:
  // 1. No es cortesía Y el plan es nulo/inválido
  // 2. El estatus de instructor no es ACTIVO (pendiente aprobación)
  const isPlanMissing = !isCourtesy && (!planName || planName === 'SIN PLAN');
  const isLocked = !isActiveStatus || isPlanMissing;
  
  const lockMessage = !isActiveStatus 
    ? "Funcionalidad disponible tras la aprobación manual de tu cuenta." 
    : "Requiere un plan activo para crear nuevos cursos.";

  const baseStyles = "px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest leading-none";
  const activeStyles = "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 shadow-blue-500/20";
  const lockedStyles = "bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed grayscale opacity-60";

  if (isLocked) {
    return (
      <div className="relative group/lock inline-block">
        <button
          disabled
          className={`${baseStyles} ${lockedStyles} ${className || ''}`}
        >
          <span>🔒</span>
          + Nuevo Curso
        </button>
        
        {/* Tooltip Informativo */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-black/95 border border-white/10 rounded-2xl text-[10px] text-yellow-500 font-bold text-center leading-relaxed opacity-0 group-hover/lock:opacity-100 transition-all pointer-events-none z-50 shadow-2xl backdrop-blur-md scale-95 group-hover/lock:scale-100">
            {lockMessage}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/95"></div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/dashboard/instructor/courses/new"
      className={`${baseStyles} ${activeStyles} ${className || ''}`}
    >
      + Nuevo Curso
    </Link>
  );
}
