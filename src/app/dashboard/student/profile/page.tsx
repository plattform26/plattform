'use client';

import { useState, useEffect } from 'react';
import PasswordChangeModal from '@/components/PasswordChangeModal';

export default function StudentProfilePage({ impersonateId, isAdminMode = false }: { impersonateId?: string, isAdminMode?: boolean }) {
  const [formData, setFormData] = useState({ name: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Endpoint dinámico: Admin vs Estudiante
      const endpoint = isAdminMode ? `/api/admin/users/${impersonateId}` : '/api/auth/me';
      const res = await fetch(endpoint);
      const data = await res.json();

      if (isAdminMode) {
        setFormData({ 
            name: data?.name || '', 
            lastName: data?.lastName || '', 
            email: data?.email || '' 
        });
      } else {
        if (data.authenticated) {
            setFormData({ name: data.name || '', lastName: data.lastName || '', email: data.email || '' });
        }
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [impersonateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Endpoint dinámico para guardar
      const endpoint = isAdminMode ? `/api/admin/users/${impersonateId}` : '/api/student/profile';
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: formData.name, 
            lastName: formData.lastName,
            email: isAdminMode ? formData.email : undefined // Solo admin puede editar core email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: isAdminMode ? '¡Perfil actualizado por Admin!' : '¡Perfil actualizado correctamente!' });
      if (isAdminMode) await fetchProfile();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse uppercase tracking-widest text-[10px] text-gray-500">Cargando identidad digital...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in font-poppins">
      <div className="mb-10">
        <h1 className="text-3xl font-space-grotesk font-extrabold text-white">
            {isAdminMode ? 'Gestión de' : 'Mi'} <span className="text-cyan-400 font-black">{isAdminMode ? 'Usuario' : 'Perfil'}</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm italic font-light tracking-wide uppercase text-[10px] tracking-[0.2em]">
            {isAdminMode ? `Editando como Administrador: ${formData.email}` : 'Configura tu identidad en el ecosistema Plattform.'}
        </p>
      </div>

      <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-8 text-[11px] font-black uppercase tracking-widest border animate-fade-in ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-lg shadow-green-600/10' : 'bg-red-500/10 border-red-500/40 text-red-400 shadow-lg shadow-red-600/10'
          }`}>
            {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                Correo Electrónico {isAdminMode ? '🔓' : '🔒'}
            </label>
            <input 
              type="text" 
              readOnly={!isAdminMode}
              value={formData.email}
              onChange={isAdminMode ? e => setFormData({...formData, email: e.target.value}) : undefined}
              className={`w-full bg-[#070d1a] border border-blue-500/10 rounded-2xl px-6 py-4 text-sm font-mono italic ${isAdminMode ? 'text-cyan-400 border-cyan-500/30' : 'text-gray-600 cursor-not-allowed'}`}
            />
            {!isAdminMode && <p className="text-[9px] text-gray-600 ml-1">El correo no puede ser modificado por seguridad.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-cyan-400 transition-colors">Nombre</label>
              <input 
                type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all font-medium"
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-cyan-400 transition-colors">Apellidos</label>
              <input 
                type="text" required value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all font-medium"
                placeholder="Tus apellidos"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={saving}
            className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.3em] text-[10px]"
          >
            {saving ? 'Procesando...' : isAdminMode ? '💾 Desplegar Cambios' : 'Actualizar Perfil'}
          </button>
        </form>

        {/* SECURITY SECTION */}
        <div className="mt-10 pt-8 border-t border-blue-500/10">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Seguridad de Cuenta</h3>
            <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2 group"
            >
                <span className="group-hover:rotate-12 transition-transform">🔐</span>
                Cambiar Contraseña de Acceso
            </button>
            <p className="text-[9px] text-gray-600 mt-4 text-center italic">Protege tu acceso con el sistema de validación avanzada de Plattform.</p>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <PasswordChangeModal 
            onClose={() => setShowPasswordModal(false)}
            onSuccess={(msg) => setMessage({ type: 'success', text: msg })}
            isAdminMode={isAdminMode}
            targetUserId={impersonateId}
        />
      )}
    </div>
  );
}
