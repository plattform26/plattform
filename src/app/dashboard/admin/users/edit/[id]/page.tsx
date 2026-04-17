'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InstructorProfilePage from '@/app/dashboard/instructor/profile/page';
import StudentProfilePage from '@/app/dashboard/student/profile/page';

export default function AdminImpersonationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role'); // 'instructor' o 'student'
  
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el Formulario Base (God Mode)
  const [formData, setFormData] = useState({
     name: '',
     lastName: '',
     email: '',
     role: '',
     status: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Obtener datos del usuario objetivo
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        
        if (res.ok && !data.error) {
          setUser(data);
          setFormData({
             name: data.name || '',
             lastName: data.lastName || '',
             email: data.email || '',
             role: data.role || '',
             status: data.status || ''
          });
        } else {
          setError(data.error || 'Error al cargar usuario');
        }

        // 2. Obtener mi propia identidad para seguridad (self-edit detection)
        const resMe = await fetch('/api/auth/me');
        const dataMe = await resMe.json();
        if (dataMe.authenticated) {
           setCurrentUser(dataMe);
        }
      } catch (err: any) {
        console.error('🔥 [ADMIN_UI_FATAL]:', err);
        setError('Error crítico de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBaseSave = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSaving(true);
     try {
        const res = await fetch(`/api/admin/users/${id}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(formData)
        });
        if (res.ok) {
           alert('Datos base actualizados exitosamente');
           // Refrescar para asegurar coherencia
           const updated = await res.json();
           setUser((prev: any) => ({ ...prev, ...updated.user }));

        } else {
           const err = await res.json();
           alert(`Error: ${err.error || 'No se pudo guardar'}`);
        }
     } catch (err) {
        console.error('Error saving base data:', err);
        alert('Error de conexión al guardar');
     } finally {
        setIsSaving(false);
     }
  };

  const effectiveRole = user?.role?.toLowerCase() || roleFromUrl?.toLowerCase();
  const isEditingSelf = currentUser?.userId === id;

  if (loading && !effectiveRole) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse italic">
          Sincronizando Identidad Maestra...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* CABECERA DE MODO DIOS */}
      <div className="bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500 p-6 rounded-r-3xl mb-12 shadow-xl shadow-red-500/5">
        <div className="flex items-center gap-4">
          <span className="text-2xl drop-shadow-lg">🛡️</span>
          <div>
            <h2 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] italic">Modo Administrador Activo (GOD MODE)</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-1">
              {loading ? (
                <span className="animate-pulse">Cargando datos del objetivo...</span>
              ) : (
                <>Estás editando el perfil de <span className="text-white font-black">[{user?.name || 'Usuario'} {user?.lastName || ''}]</span> con privilegios totales.</>
              )}
            </p>
            {error && <p className="text-[9px] text-red-400 mt-2 font-mono uppercase font-black tracking-widest bg-red-500/10 px-2 py-1 inline-block rounded">⚠️ {error}</p>}
          </div>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL POR ROL */}
      {(effectiveRole === 'instructor' && user?.instructorProfile) ? (
        <InstructorProfilePage searchParams={{ impersonateId: id, isAdminMode: 'true' }} />
      ) : effectiveRole === 'student' ? (
        <StudentProfilePage searchParams={{ impersonateId: id, isAdminMode: 'true' }} />
      ) : (
        /* FORMULARIO DE DATOS BASE (Para Admins o Usuarios sin perfil específico) */
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-[#0d1524] border border-blue-500/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -mr-32 -mt-32" />
              
              <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">👤</div>
                 <div>
                    <h3 className="text-xl font-space-grotesk font-black text-white uppercase tracking-tighter">Datos Primarios de Usuario</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Configuración esencial de identidad y acceso</p>
                 </div>
              </div>

              <form onSubmit={handleBaseSave} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Nombre</label>
                       <input 
                         type="text" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-medium"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Apellidos</label>
                       <input 
                         type="text" 
                         value={formData.lastName}
                         onChange={e => setFormData({...formData, lastName: e.target.value})}
                         className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-medium"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Email Principal</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6 pt-4">
                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Rol en Plataforma</label>
                       {isEditingSelf ? (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl px-5 py-4">
                             <span className="text-red-400 text-xs font-black uppercase tracking-widest">ADMIN (Bloqueado)</span>
                             <p className="text-[8px] text-red-500/60 font-medium uppercase mt-1 italic">No puedes cambiar tu propio rol para evitar pérdida de acceso.</p>
                          </div>
                       ) : (
                          <select 
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                            className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-bold uppercase tracking-widest"
                          >
                             <option value="STUDENT">Alumno</option>
                             <option value="INSTRUCTOR">Instructor</option>
                             <option value="ADMIN">Administrador</option>
                          </select>
                       )}
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Estado de Cuenta</label>
                       <select 
                         value={formData.status}
                         onChange={e => setFormData({...formData, status: e.target.value})}
                         className={`w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-4 text-sm font-bold transition-all uppercase tracking-widest ${
                            formData.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                         }`}
                       >
                          <option value="ACTIVE">Activo</option>
                          <option value="PENDING_APPROVAL">Pendiente de Aprobación</option>
                          <option value="SUSPENDED">Suspendido</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-8 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                       {isSaving ? 'Guardando...' : 'Actualizar Usuario'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
