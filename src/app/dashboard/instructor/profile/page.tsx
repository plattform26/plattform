'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [personalForm, setPersonalForm] = useState({ name: '', lastName: '' });
  const [academyForm, setAcademyForm] = useState({ academyName: '', description: '', institution: '', logoUrl: '', linkedinUrl: '', slug: '' });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAcademy, setSavingAcademy] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const fetchProfile = async () => {
    const res = await fetch('/api/instructor/profile');
    const d = await res.json();
    setProfile(d);
    setPersonalForm({
        name: d.user?.name || '',
        lastName: d.user?.lastName || ''
    });
    setAcademyForm({
        academyName: d.academyName || '',
        description: d.description || '',
        institution: d.institution || '',
        logoUrl: d.logoUrl || '',
        linkedinUrl: d.linkedinUrl || '',
        slug: d.slug || ''
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showMsg = (m: string) => {
    setSavedMsg(m);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSavePersonal = async () => {
    setSavingPersonal(true);
    const res = await fetch('/api/instructor/profile/personal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personalForm),
    });
    if (res.ok) showMsg('✓ Datos personales guardados');
    setSavingPersonal(false);
  };

  const handleSaveAcademy = async () => {
    setSavingAcademy(true);
    const res = await fetch('/api/instructor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(academyForm),
    });
    if (res.ok) showMsg('✓ Datos de academia guardados');
    setSavingAcademy(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Máximo 2MB'); return; }
    
    const reader = new FileReader();
    reader.onloadend = () => {
        setAcademyForm({ ...academyForm, logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (!profile) return <div className="text-gray-400 py-20 text-center animate-pulse uppercase tracking-widest text-xs">Cifrando Datos del Perfil...</div>;

  return (
    <div className="animate-fade-in font-poppins space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-space-grotesk font-black text-white">Configuración del <span className="text-cyan-400">Instructor</span></h1>
           <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold text-[10px] italic">Gestiona tu identidad y tu marca educativa.</p>
        </div>
        <Link 
            href={`/instructor/${profile.slug}`} 
            target="_blank"
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all text-center tracking-widest uppercase"
        >
            Ver mi academia pública ↗
        </Link>
      </div>

      {savedMsg && <div className="fixed top-24 right-8 z-50 bg-cyan-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-2xl shadow-cyan-500/20 animate-bounce">{savedMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* PERSONAL DATA */}
        <div className="space-y-6">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-8 h-px bg-cyan-500/30"></span> Perfil Personal
            </h3>
            <div className="bg-[#0d1524] border border-blue-500/10 rounded-3xl p-8 space-y-5">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Nombre(s)</label>
                        <input value={personalForm.name} onChange={e => setPersonalForm({ ...personalForm, name: e.target.value })}
                            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Apellido(s)</label>
                        <input value={personalForm.lastName} onChange={e => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                            className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Correo Electrónico 🔒</label>
                    <input value={profile.user?.email || ''} readOnly
                        className="w-full bg-[#0d1524] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-600 cursor-not-allowed italic font-mono" />
                </div>
                <div className="pt-4 flex justify-end">
                    <button onClick={handleSavePersonal} disabled={savingPersonal}
                        className="px-8 py-3 bg-blue-600 rounded-xl text-xs font-black text-white hover:scale-105 transition-all disabled:opacity-50 uppercase tracking-widest">
                        {savingPersonal ? 'Guardando...' : 'Actualizar Perfil'}
                    </button>
                </div>
            </div>
        </div>

        {/* ACADEMY DATA */}
        <div className="space-y-6">
            <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-8 h-px bg-blue-500/30"></span> Marca Institucional
            </h3>
            <div className="bg-[#0d1524] border border-blue-500/10 rounded-3xl p-8 space-y-5">
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Imagen de Academia</label>
                    <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black flex items-center justify-center shrink-0 border border-white/10">
                            {academyForm.logoUrl ? (
                                <img src={academyForm.logoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl">🏫</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" id="logoUpload" />
                            <label htmlFor="logoUpload" className="cursor-pointer text-[10px] font-black text-cyan-400 hover:text-white transition-colors uppercase tracking-widest underline decoration-cyan-500/30">Subir Nueva Imagen</label>
                            <p className="text-[9px] text-gray-600 mt-1 italic font-mono">JPG, PNG, WEBP (Máx 2MB)</p>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Nombre de la Academia *</label>
                    <input value={academyForm.academyName} onChange={e => setAcademyForm({ ...academyForm, academyName: e.target.value })}
                        className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">LinkedIn (URL Perfil)</label>
                    <input value={academyForm.linkedinUrl} onChange={e => setAcademyForm({ ...academyForm, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/tuperfil"
                        className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic flex items-center gap-2">
                        Identificador de URL (Slug) *
                        <span className="group relative">
                            <span className="cursor-help bg-blue-500/20 text-blue-400 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border border-blue-500/30">?</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#152035] border border-blue-500/30 rounded-xl text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                                Esta es tu 'identidad' en la URL. Ejemplo: plattform.com/instructor/<span className="text-cyan-400">tu-nombre</span>
                            </span>
                        </span>
                    </label>
                    <input value={academyForm.slug} onChange={e => setAcademyForm({ ...academyForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="tu-academia-slug"
                        className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors font-mono" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Institución / Universidad</label>
                    <input value={academyForm.institution} onChange={e => setAcademyForm({ ...academyForm, institution: e.target.value })}
                        placeholder="Ej. UNAM, ITESM, etc."
                        className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Misión y Visión (Descripción)</label>
                    <textarea value={academyForm.description} onChange={e => setAcademyForm({ ...academyForm, description: e.target.value })}
                        rows={3} placeholder="Cuéntanos el impacto que buscas generar..."
                        className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none" />
                </div>
                <div className="pt-4 flex justify-end">
                    <button onClick={handleSaveAcademy} disabled={savingAcademy}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-xs font-black text-white hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 uppercase tracking-widest">
                        {savingAcademy ? 'Guardando...' : 'Guardar Marca'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
