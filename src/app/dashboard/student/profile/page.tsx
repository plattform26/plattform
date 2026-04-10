'use client';

import { useState, useEffect } from 'react';

export default function StudentProfilePage() {
  const [formData, setFormData] = useState({ name: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setFormData({ name: data.name || '', lastName: data.lastName || '', email: data.email || '' });
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, lastName: formData.lastName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
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
        <h1 className="text-3xl font-space-grotesk font-extrabold text-white">Mi <span className="text-cyan-400 font-black">Perfil</span></h1>
        <p className="text-gray-400 mt-2 text-sm italic font-light tracking-wide uppercase text-[10px] tracking-[0.2em]">Configura tu identidad en el ecosistema Plattform.</p>
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
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
            <input 
              type="text" disabled value={formData.email}
              className="w-full bg-[#070d1a] border border-blue-500/10 rounded-2xl px-6 py-4 text-sm text-gray-600 font-mono italic cursor-not-allowed"
            />
            <p className="text-[9px] text-gray-600 ml-1">El correo no puede ser modificado por seguridad.</p>
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
            {saving ? 'Codificando Cambios...' : 'Guardar Identidad'}
          </button>
        </form>
      </div>
    </div>
  );
}
