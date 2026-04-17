'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SignOutButton from './SignOutButton';
import PasswordChangeModal from './PasswordChangeModal';

interface User {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  academySlug?: string;
}

export default function ProfileMenu({ user, isCollapsed = false }: { user: User | null, isCollapsed?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (() => {
    const n = user?.name || '';
    const l = user?.lastName || '';
    if (n && l) return `${n[0]}${l[0]}`.toUpperCase();
    if (n) return n[0].toUpperCase();
    return 'U';
  })();
  const roleLabel = user?.role === 'STUDENT' ? 'Alumno' : user?.role === 'INSTRUCTOR' ? 'Instructor' : 'Admin';
  const profileLink = user?.role === 'STUDENT' 
    ? '/dashboard/student/profile' 
    : user?.role === 'INSTRUCTOR' 
      ? '/dashboard/instructor/profile' 
      : `/dashboard/admin/users/edit/${user?.id || (user as any)?.userId}?role=admin`;



  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 ${isCollapsed ? 'px-2 py-4 justify-center' : 'px-4 py-2'} mb-4 hover:bg-blue-500/5 rounded-xl transition-all w-full text-left group`}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 border border-blue-400/20 flex items-center justify-center font-bold text-sm uppercase shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
          {initials}
        </div>
        {!isCollapsed && (
          <>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name} {user?.lastName}</p>
              <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest">{roleLabel}</p>
            </div>
            <span className={`text-[10px] text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute bottom-full left-0 w-64 mb-2 bg-[#0d1524] border border-blue-500/20 rounded-2xl shadow-2xl shadow-black/50 py-2 z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-blue-500/10 mb-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Sesión activa</p>
            <p className="text-xs text-white font-mono truncate">{user?.email}</p>
          </div>
          
          <Link href={profileLink} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-blue-600/10 transition-all">
            <span className="text-base">👤</span> Mi perfil
          </Link>

          {user?.role === 'STUDENT' && (
            <Link href="/dashboard/student/purchases" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-blue-600/10 transition-all">
              <span className="text-base">🛍️</span> Mis compras
            </Link>
          )}

          {user?.role === 'INSTRUCTOR' && (
            <Link href={`/instructor/${user?.academySlug || ''}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-blue-600/10 transition-all">
              <span className="text-base">🏫</span> Ver mi academia pública
            </Link>
          )}

          <button 
            onClick={() => { setIsOpen(false); setShowPasswordModal(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-blue-600/10 transition-all text-left"
          >
            <span className="text-base">🔐</span> Cambiar contraseña
          </button>

          <div className="mt-2 pt-2 border-t border-blue-500/10">
            <SignOutButton className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left" />
          </div>
        </div>
      )}

      {/* RENDERIZADO DEL MODAL ESTANDARIZADO (HAWK EYE) */}
      {showPasswordModal && (
        <PasswordChangeModal 
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(msg) => {
            // Se puede integrar un pequeño toast aquí si fuera necesario
            setShowPasswordModal(false);
          }}
        />
      )}
    </div>
  );
}
