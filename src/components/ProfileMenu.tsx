'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SignOutButton from './SignOutButton';

interface User {
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

  // Modal Password States
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passForm.new !== passForm.confirm) {
      return setPassError('Las contraseñas no coinciden');
    }

    setPassLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.new })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPassSuccess('¡Contraseña actualizada con éxito!');
      setPassForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err: any) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  const initials = user?.name && user?.lastName ? `${user.name[0]}${user.lastName[0]}`.toUpperCase() : 'U';
  const roleLabel = user?.role === 'STUDENT' ? 'Alumno' : user?.role === 'INSTRUCTOR' ? 'Instructor' : 'Admin';
  const profileLink = user?.role === 'STUDENT' ? '/dashboard/student/profile' : '/dashboard/instructor/profile';

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

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[#070d1a]/90 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-fade-in">
          <div className="bg-[#0d1524] border border-blue-500/20 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-6 right-6 text-2xl text-gray-500 hover:text-white transition-colors"
            >
              ×
            </button>
            
            <div className="mb-8">
               <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Cambiar contraseña</h3>
               <p className="text-xs text-gray-500 italic">Asegúrate de usar al menos 8 caracteres robustos.</p>
            </div>

            {passError && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl mb-6">{passError}</div>}
            {passSuccess && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-xl mb-6">{passSuccess}</div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Contraseña Actual</label>
                  <input 
                    type="password" required className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:border-blue-500 outline-none"
                    value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Nueva Contraseña</label>
                  <input 
                    type="password" required className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:border-cyan-500 outline-none"
                    value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" required className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:border-cyan-500 outline-none"
                    value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})}
                  />
               </div>

               <button 
                 type="submit" disabled={passLoading}
                 className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
               >
                 {passLoading ? 'Procesando...' : 'Actualizar Contraseña'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
