'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PasswordChangeModal from '@/components/PasswordChangeModal';

export default function ProfilePage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const impersonateId = searchParams.impersonateId as string | undefined;
  const isAdminMode = searchParams.isAdminMode === 'true';
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalForm, setPersonalForm] = useState({ name: '', lastName: '', specialty: '', email: '' });
  const [academyForm, setAcademyForm] = useState({ academyName: '', description: '', institution: '', logoUrl: '', linkedinUrl: '', slug: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD') // Separar caracteres base de acentos
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/\s+/g, '-') // Espacios por guiones
      .replace(/[^\w-]+/g, '') // Eliminar caracteres no alfanuméricos
      .replace(/--+/g, '-') // Limpiar guiones dobles
      .replace(/^-+/, '') // Quitar guión inicial
      .replace(/-+$/, ''); // Quitar guión final
  };

  const fetchProfile = async () => {
    try {
        setLoading(true);
        setError(null);
        
        // Determinar endpoint según el modo
        const endpoint = isAdminMode ? `/api/admin/users/${impersonateId}` : '/api/instructor/profile';
        const res = await fetch(endpoint);
        
        if (!res.ok) {
            throw new Error(`Error del servidor (${res.status})`);
        }

        const d = await res.json();
        
        // Normalización: El API de Admin devuelve el objeto Usuario directamente con instructorProfile incluido
        const userObj = isAdminMode ? d : d.user;
        const profileObj = isAdminMode ? d.instructorProfile : d;

        if (userObj) {
            setProfile(d);
            setPersonalForm({
                name: userObj.name || '',
                lastName: userObj.lastName || '',
                specialty: profileObj?.specialty || '', // Actualizado: ahora viene del perfil
                email: userObj.email || ''
            });
            setAcademyForm({
                academyName: profileObj?.academyName || '',
                description: profileObj?.description || '',
                institution: profileObj?.institution || '',
                logoUrl: profileObj?.logoUrl || '',
                linkedinUrl: profileObj?.linkedinUrl || '',
                slug: profileObj?.slug || userObj.name.toLowerCase().replace(/\s+/g, '-') 
            });
        }
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.message || 'No se pudo cargar el perfil');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [impersonateId]);

  // Automatización del Slug (Solo si academyName cambia)
  useEffect(() => {
    if (academyForm.academyName) {
        setAcademyForm(prev => ({ ...prev, slug: slugify(prev.academyName) }));
    } else if (personalForm.name && !academyForm.slug) {
        setAcademyForm(prev => ({ ...prev, slug: slugify(personalForm.name + '-' + personalForm.lastName) }));
    }
  }, [academyForm.academyName]);

  const showMsg = (m: string) => {
    setSavedMsg(m);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        if (isAdminMode) {
            // En modo admin usamos el endpoint de actualización universal
            const res = await fetch(`/api/admin/users/${impersonateId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...personalForm,
                    ...academyForm
                }),
            });
            if (res.ok) {
                showMsg('✓ Perfil actualizado por Administrador');
                await fetchProfile();
            } else {
                showMsg('❌ Error en actualización administrativa');
            }
        } else {
            // Modo instructor estándar (paralelo)
            const [resPersonal, resAcademy] = await Promise.all([
                fetch('/api/instructor/profile/personal', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(personalForm),
                }),
                fetch('/api/instructor/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(academyForm),
                })
            ]);

            if (resPersonal.ok && resAcademy.ok) {
                showMsg('✓ Todos los cambios guardados con éxito');
                await fetchProfile();
            } else {
                showMsg('⚠ Algunos cambios podrían no haberse guardado');
            }
        }
    } catch (err) {
        showMsg('❌ Error al guardar los cambios');
        console.error(err);
    } finally {
        setIsSaving(false);
    }
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

  if (loading) return <div className="text-gray-400 py-20 text-center animate-pulse uppercase tracking-widest text-xs italic font-bold">Cifrando Datos del Perfil...</div>;

  if (error) return (
    <div className="py-20 text-center space-y-4">
        <p className="text-red-500 font-black text-sm uppercase tracking-widest italic">{error}</p>
        <button onClick={fetchProfile} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all">Reintentar Carga</button>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="animate-fade-in font-poppins space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-space-grotesk font-black text-white">Configuración del <span className="text-cyan-400">Instructor</span></h1>
           <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold text-[10px] italic">Gestiona tu identidad y tu marca educativa.</p>
        </div>
        <Link 
            href={isAdminMode ? (profile?.instructorProfile?.slug ? `/instructor/${profile.instructorProfile.slug}` : '#') : (profile?.slug ? `/instructor/${profile.slug}` : '#')} 
            target="_blank"
            className={`px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all text-center tracking-widest uppercase ${(!profile?.slug && !profile?.instructorProfile?.slug) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
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
                    <div className="flex-1 text-gray-400">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic flex items-center gap-1">
                            Nombre(s) {isAdminMode ? '🔓' : '🔒'}
                        </label>
                        <input value={personalForm.name} 
                            readOnly={!isAdminMode}
                            onChange={isAdminMode ? e => setPersonalForm({...personalForm, name: e.target.value}) : undefined}
                            className={`w-full bg-[#0d1524] border border-white/5 rounded-xl px-4 py-3 text-sm italic font-medium ${isAdminMode ? 'text-white border-cyan-500/20' : 'text-gray-500 cursor-not-allowed opacity-60'}`} />
                    </div>
                    <div className="flex-1 text-gray-400">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic flex items-center gap-1">
                            Apellido(s) {isAdminMode ? '🔓' : '🔒'}
                        </label>
                        <input value={personalForm.lastName} 
                            readOnly={!isAdminMode}
                            onChange={isAdminMode ? e => setPersonalForm({...personalForm, lastName: e.target.value}) : undefined}
                            className={`w-full bg-[#0d1524] border border-white/5 rounded-xl px-4 py-3 text-sm italic font-medium ${isAdminMode ? 'text-white border-cyan-500/20' : 'text-gray-500 cursor-not-allowed opacity-60'}`} />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Correo Electrónico {isAdminMode ? '🔓' : '🔒'}</label>
                    <input value={personalForm.email} 
                        readOnly={!isAdminMode}
                        onChange={isAdminMode ? e => setPersonalForm({...personalForm, email: e.target.value}) : undefined}
                        className={`w-full bg-[#0d1524] border border-white/5 rounded-xl px-4 py-3 text-sm font-mono italic ${isAdminMode ? 'text-cyan-400 border-cyan-500/20' : 'text-gray-500 cursor-not-allowed opacity-60'}`} />
                </div>
                <div className="px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
                    <span className="text-xl">🛡️</span>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed italic">
                        Información de identidad protegida. Si requieres actualizar tus datos oficiales, por favor <Link href="/dashboard/support" className="text-cyan-400 underline decoration-cyan-500/30 hover:text-white transition-colors">contacta a Soporte</Link>.
                    </p>
                </div>

                {/* PASSWORD CHANGE TRIGGER */}
                <div className="pt-2">
                    <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                    >
                        <span className="group-hover:rotate-12 transition-transform">🔐</span>
                        Cambiar Contraseña de Acceso
                    </button>
                </div>
                <div className="pt-4">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Especialidad Profesional</label>
                    <input 
                        value={personalForm.specialty} 
                        onChange={e => setPersonalForm({ ...personalForm, specialty: e.target.value })}
                        placeholder="Ej. Experto en Inteligencia Artificial, Consultor Financiero..."
                        className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" 
                    />
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
                        Identificador de URL (Slug) {isAdminMode ? '🔓' : '🔒'}
                        <span className="group relative">
                            <span className="cursor-help bg-blue-500/20 text-blue-400 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border border-blue-500/30">?</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#152035] border border-blue-500/30 rounded-xl text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                                Tu URL se genera automáticamente a partir de tu nombre de academia.
                            </span>
                        </span>
                    </label>
                    <input value={academyForm.slug} 
                        readOnly={!isAdminMode}
                        onChange={isAdminMode ? e => setAcademyForm({...academyForm, slug: e.target.value}) : undefined}
                        placeholder="generando-slug..."
                        className={`w-full bg-[#0d1524] border border-blue-500/5 rounded-xl px-4 py-3 text-sm font-mono ${isAdminMode ? 'text-cyan-400 border-cyan-500/20' : 'text-cyan-400 cursor-not-allowed opacity-60'}`} />
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
                    <button onClick={handleSaveChanges} disabled={isSaving}
                        className="px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-xs font-black text-white hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 uppercase tracking-[0.2em]">
                        {isSaving ? 'Guardando Cambios...' : 'Guardar Todos los Cambios'}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* PASSWORDS MODAL */}
      {showPasswordModal && (
          <PasswordChangeModal 
            onClose={() => setShowPasswordModal(false)}
            onSuccess={(msg) => showMsg(msg)}
            isAdminMode={isAdminMode}
            targetUserId={impersonateId}
          />
      )}
    </div>
  );
}
