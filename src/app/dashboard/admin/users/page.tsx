'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { exportToCSV, exportToExcel } from '@/lib/export-utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>(''); // Default: All
  const [search, setSearch] = useState<string>('');
  const [plans, setPlans] = useState<any[]>([]);

  // Misión: Modal de Borrado Seguro
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Misión: Auditoría de Inscripciones (Deep Audit)
  const [auditingUserId, setAuditingUserId] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [isAuditError, setIsAuditError] = useState(false);

  // Misión: Expansión Administrativa v7.0 (Creación de Usuarios)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
     name: '', lastName: '', email: '', password: '', role: 'STUDENT'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (role) q.append('role', role);
      if (search) q.append('q', search);
      
      const res = await fetch(`/api/admin/users?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans');
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      }
    };
    fetchPlans();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleExportCSV = () => {
    const exportData = users.map(u => ({
       ID: u.id,
       Nombre: `${u.name} ${u.lastName}`,
       Email: u.email,
       Rol: u.role,
       Especialidad: u.specialty || '',
       Estado: u.status,
       'Cursos/Inscrip': u.role === 'INSTRUCTOR' ? (u._count?.courses ?? 0) : (u._count?.enrollments ?? 0),
       'Registrado El': new Date(u.createdAt).toLocaleDateString(),
       'Última Conexión': u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Nunca'
    }));
    exportToCSV(exportData, 'plattform-usuarios-2025');
  };

  const handleExportExcel = () => {
    const exportData = users.map(u => ({
       ID: u.id,
       Nombre: `${u.name} ${u.lastName}`,
       Email: u.email,
       Rol: u.role,
       Especialidad: u.specialty || '',
       Estado: u.status,
       'Cursos/Inscrip': u.role === 'INSTRUCTOR' ? (u._count?.courses ?? 0) : (u._count?.enrollments ?? 0),
       'Registrado El': new Date(u.createdAt).toLocaleDateString(),
       'Última Conexión': u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Nunca',
       Courtesy: u.isCourtesy ? 'YES' : 'NO'
    }));
    exportToExcel(exportData, 'plattform-usuarios-2025', 'Usuarios');
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason })
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setShowDeleteModal(false);
        setUserToDelete(null);
        setDeleteReason('');
      } else {
        const err = await res.json();
        alert(`Error al borrar: ${err.error || 'Desconocido'}`);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({ name: '', lastName: '', email: '', password: '', role: 'STUDENT' });
        fetchUsers();
        alert('Usuario creado exitosamente');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error('Error creating user:', err);
    } finally {
      setIsCreating(false);
    }
  };

   const handleAudit = async (userId: string) => {
    if (auditingUserId === userId) {
      setAuditingUserId(null);
      setAuditData([]);
      setIsAuditError(false);
      return;
    }
    setAuditingUserId(userId);
    setIsAuditLoading(true);
    setIsAuditError(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}/audit`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      console.error('Audit Fetch Error:', err);
      setIsAuditError(true);
    } finally {
      setIsAuditLoading(false);
    }
  };


  const getColorByRole = (role: string) => {
     if (role === 'ADMIN') return 'text-red-400 bg-red-400/10';
     if (role === 'INSTRUCTOR') return 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20';
     return 'text-blue-400 bg-blue-400/10 border border-blue-400/20';
  };

  return (
    <div className="space-y-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-space-grotesk font-bold">Gestión de <span className="text-cyan-400">Usuarios</span></h1>
             <p className="text-gray-400 mt-2 font-light tracking-wide">Administra el acceso y roles de toda la plataforma.</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all uppercase tracking-widest leading-none flex items-center gap-2">
                <span>➕</span> Crear Usuario
             </button>
             <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-blue-500/10 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all uppercase tracking-widest leading-none">Exportar CSV</button>
             <button onClick={handleExportExcel} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0d1524] border border-green-500/10 hover:border-green-500/50 hover:bg-green-600/10 transition-all uppercase tracking-widest leading-none">Exportar Excel</button>
          </div>
       </div>

       {/* FILTROS */}
       <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#0d1524]/50 border border-blue-500/10 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex gap-2 p-1 bg-[#152035] rounded-xl self-start border border-blue-500/10">
             {['', 'INSTRUCTOR', 'STUDENT'].map(r => (
                <button 
                  key={r} 
                  onClick={() => setRole(r)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter ${role === r ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-gray-500 hover:text-white'}`}
                >
                   {r === '' ? 'Todos' : r === 'INSTRUCTOR' ? 'Instructores' : 'Alumnos'}
                </button>
             ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
             <input 
               type="text" 
               placeholder="🔍 Filtar por nombre, correo..." 
               className="w-full md:w-80 bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-all"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
             <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 uppercase">Filtrar</button>
          </form>
       </div>

       {/* TABLA DE USUARIOS */}
       <div className="overflow-x-auto bg-[#0d1524] border border-blue-500/10 rounded-3xl shadow-2xl">
          <table className="w-full text-left border-collapse">
             <thead className="bg-[#152035]/50 border-b border-blue-500/10">
                <tr>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Usuario</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Rol</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Especialidad</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Cursos/Inscrip</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Estado</th>
                                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Plan y Acceso</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Reg/Conexión</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-blue-500/5">
                {loading ? (
                   <tr>
                      <td colSpan={8} className="p-20 text-center text-gray-500 animate-pulse">Cargando base de datos de usuarios...</td>
                   </tr>
                ) : users.map(user => (
                    <Fragment key={user.id}>
                   <tr key={user.id} className="hover:bg-blue-600/5 transition-colors group">
                      <td className="p-6 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20">
                               {user.name[0]}{user.lastName[0]}
                            </div>
                            <div>
                               <p className="font-bold text-gray-200">{user.name} {user.lastName}</p>
                               <p className="text-xs text-gray-500 font-mono italic">{user.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-6 whitespace-nowrap">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${getColorByRole(user.role)}`}>
                            {user.role}
                         </span>
                      </td>
                      <td className="p-6 whitespace-nowrap">
                         <div className="text-xs font-bold text-cyan-400/80 italic">
                            {user.specialty || (user.role === 'INSTRUCTOR' ? 'Pendiente' : '—')}
                         </div>
                      </td>
                      <td className="p-6 whitespace-nowrap">
                         <div className="text-lg font-extrabold text-gray-300">
                            {user.role === 'INSTRUCTOR' ? (user._count?.courses ?? 0) : (user._count?.enrollments ?? 0)}
                         </div>
                      </td>
                      <td className="p-6 whitespace-nowrap">
                         <div className={`flex items-center gap-2 text-xs font-bold ${
                           user.status === 'ACTIVE' ? 'text-green-400' : 
                           user.status === 'PENDING_APPROVAL' ? 'text-yellow-400' : 'text-red-400'
                         }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'ACTIVE' ? 'bg-green-400' : 
                              user.status === 'PENDING_APPROVAL' ? 'bg-yellow-400' : 'bg-red-400'
                            } ${user.status !== 'SUSPENDED' ? 'animate-pulse' : ''}`}></span>
                            {user.status === 'ACTIVE' ? 'ACTIVO' : 
                             user.status === 'PENDING_APPROVAL' ? 'PENDIENTE' : 'SUSPENDIDO'}
                         </div>
                      </td>
                      <td className="p-6 min-w-[200px]">
                         {user.role === 'INSTRUCTOR' ? (
                            <div className="flex flex-col gap-3">
                               {/* ETIQUETA DE PLAN */}
                               <div className="flex flex-col gap-1">
                                  <span className={`text-[10px] font-black uppercase tracking-tighter ${user.planOrigin === 'CORTESÍA' ? 'text-yellow-400' : user.planOrigin === 'PAGO_STRIPE' ? 'text-cyan-400' : 'text-gray-500'}`}>
                                     {user.activePlanName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                     <span className={`px-2 py-0.5 rounded text-[8px] font-black border tracking-widest uppercase ${
                                       user.planOrigin === 'CORTESÍA' ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-500' : 
                                       user.planOrigin === 'PAGO_STRIPE' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' : 
                                       'bg-red-500/10 border-red-500/20 text-red-500'
                                     }`}>
                                        {user.planOrigin === 'NINGUNO' ? 'SIN PLAN' : user.planOrigin}
                                     </span>
                                     {user.planKeyDate && (
                                        <span className="text-[9px] text-gray-600 font-bold lowercase tracking-tighter">
                                           {user.planKeyLabel}: {new Date(user.planKeyDate).toLocaleDateString()}
                                        </span>
                                     )}
                                  </div>
                               </div>

                               {/* CONTROLES DE CORTESÍA (COMPACTOS) */}
                               <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                     <input 
                                       type="checkbox" 
                                       checked={user.isCourtesy}
                                       onChange={(e) => handleUpdateUser(user.id, { isCourtesy: e.target.checked })}
                                       className="w-3.5 h-3.5 rounded border-blue-500/30 bg-blue-500/10 checked:bg-cyan-500 transition-all"
                                     />
                                     <span className="text-[9px] font-bold text-gray-500">CORTESÍA</span>
                                  </label>
                                  
                                  {user.isCourtesy && (
                                     <select
                                       value={user.courtesyPlanId || ''}
                                       onChange={(e) => handleUpdateUser(user.id, { courtesyPlanId: e.target.value })}
                                       className="bg-[#152035] border border-cyan-500/20 rounded-md px-1 py-0.5 text-[8px] font-bold text-cyan-200 outline-none"
                                     >
                                        <option value="">( PLAN )</option>
                                        {plans.map(p => (
                                           <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                     </select>
                                  )}
                               </div>
                            </div>
                         ) : (
                            <span className="text-gray-700 font-black text-[9px] tracking-widest uppercase">N/A</span>
                         )}
                      </td>
                      <td className="p-6 text-xs text-gray-500 font-medium whitespace-nowrap">
                          <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                          <p className="text-[9px] text-cyan-500/70 font-black tracking-tighter uppercase mt-1">
                             {user.lastLoginAt ? `Última: ${new Date(user.lastLoginAt).toLocaleDateString()}` : 'Sin conexión'}
                          </p>
                       </td>
                      <td className="p-6 text-right min-w-[400px]">
                         <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/admin/users/edit/${user.id}?role=${user.role.toLowerCase()}`} className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-blue-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-gray-400 hover:text-white">EDITAR PERFIL</Link>
                            
                             {user.status === 'PENDING_APPROVAL' && (
                                <button 
                                  onClick={() => {
                                     if(!confirm('¿Aprobar este instructor?')) return;
                                     handleUpdateUser(user.id, { status: 'ACTIVE' });
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all"
                                >
                                  APROBAR
                                </button>
                             )}

                             {user.status === 'ACTIVE' && (
                                <button 
                                  onClick={() => {
                                     if(!confirm('¿Suspender cuenta?')) return;
                                     handleUpdateUser(user.id, { status: 'SUSPENDED' });
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-500/20 hover:bg-red-500/10 text-red-400/80 hover:text-red-400 transition-all"
                                >
                                  SUSPENDER
                                </button>
                             )}

                             {user.status === 'SUSPENDED' && (
                                <button 
                                  onClick={() => handleUpdateUser(user.id, { status: 'ACTIVE' })}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-green-500/20 hover:bg-green-500/10 text-green-400/80 hover:text-green-400 transition-all"
                                >
                                  RE-ACTIVAR
                                </button>
                             )}

                             <button 
                               onClick={() => handleAudit(user.id)}
                               className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${auditingUserId === user.id ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10'} transition-all shadow-lg shadow-cyan-500/10`}
                             >
                               {auditingUserId === user.id ? 'CERRAR AUDITORÍA' : 'AUDITAR'}
                             </button>

                             <button 
                               onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteModal(true);
                               }}
                               className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600/20 hover:text-red-400 transition-all shadow-lg shadow-red-600/10 group-hover:shadow-red-600/20"
                             >
                               ELIMINAR
                             </button>
                          </div>
                      </td>
                   </tr>

                   {/* Fila de Auditoría Desplegable */}
                   {auditingUserId === user.id && (
                       <tr className="bg-cyan-500/[0.03] animate-in slide-in-from-top duration-300">
                          <td colSpan={8} className="p-8 border-y border-cyan-500/10">
                             <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                   <h4 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                      Auditoría de Aprendizaje: {user.name}
                                   </h4>
                                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                      ID: {user.id}
                                   </span>
                                </div>

                                {isAuditLoading ? (
                                   <div className="py-12 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest animate-pulse">
                                      Consultando historial académico y financiero...
                                   </div>
                                ) : auditData.length === 0 ? (
                                   <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                      {isAuditError ? (
                                          <div className="flex flex-col items-center gap-2">
                                             <p className="text-red-400 font-black text-[10px] uppercase tracking-widest">Error al cargar datos de auditoría</p>
                                             <button onClick={() => handleAudit(auditingUserId!)} className="text-[10px] text-cyan-400 underline uppercase font-bold">Reintentar</button>
                                          </div>
                                       ) : (
                                          <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Sin actividad registrada para este perfil.</p>
                                       )}
                                   </div>
                                ) : (
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                       {auditData.map((audit: any) => (
                                          <div key={`${audit.type}-${audit.courseId}`} className="bg-white/5 border border-blue-500/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group/card shadow-xl shadow-black/20">
                                             <div className="flex justify-between items-start mb-4">
                                                <h5 className="text-xs font-black text-white uppercase tracking-tight leading-tight max-w-[150px] group-hover/card:text-cyan-400 transition-colors">
                                                   {audit.courseTitle}
                                                </h5>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                                   audit.paymentSource.includes('STATUS') ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                                                   audit.paymentSource === 'BYPASS ADMIN' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                   'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                } uppercase tracking-widest`}>
                                                   {audit.paymentSource}
                                                </span>
                                             </div>

                                             <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                      {audit.type === 'CREATION' ? 'Alumnos Inscritos' : 'Progreso Académico'}
                                                   </span>
                                                   <span className="text-xs font-black text-cyan-400">
                                                      {audit.type === 'CREATION' ? audit.studentsCount : `${audit.progress}%`}
                                                   </span>
                                                </div>
                                                
                                                <div className="h-2 w-full bg-blue-900/20 rounded-full overflow-hidden mb-2">
                                                   <div 
                                                      className={`h-full transition-all duration-1000 ease-out ${audit.progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                                                      style={{ width: `${audit.progress}%` }}
                                                   />
                                                </div>

                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                                                   <div className="flex flex-wrap gap-2">
                                                      {audit.type === 'ENROLLMENT' && audit.progress === 100 && (
                                                         <span className="text-[8px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                                            COMPLETADO
                                                         </span>
                                                      )}
                                                      {audit.type === 'ENROLLMENT' && audit.hasCertificate && (
                                                         <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/20 uppercase tracking-tighter">
                                                            CERTIFICADO EMITIDO
                                                         </span>
                                                      )}
                                                      {audit.type === 'CREATION' && (
                                                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                            Catálogo Profesional
                                                         </span>
                                                      )}
                                                   </div>
                                                   <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest ml-auto">
                                                      {audit.type === 'CREATION' ? 'Creación:' : 'Inscrito:'} {new Date(audit.enrolledAt).toLocaleDateString()}
                                                   </p>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                   </div>
                                )}
                             </div>
                          </td>
                       </tr>
                    )}
                   </Fragment>
                 ))}
                {(!loading && users.length === 0) && (
                   <tr>
                      <td colSpan={8} className="p-20 text-center text-gray-500 italic">No se encontraron usuarios con estos criterios.</td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>

       {/* MODAL DE ELIMINACIÓN (Misión: UI Premium & Seguridad) */}
       {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-[#070d1a]/80 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)} />
             
             <div className="relative bg-[#0d1524] border border-red-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center mb-6">
                   <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-3xl mb-4 border border-red-600/20">
                      ⚠️
                   </div>
                   <h2 className="text-xl font-bold text-white">¿Confirmar Eliminación?</h2>
                   <p className="text-gray-400 text-sm mt-2">
                      Estás a punto de borrar a <span className="text-white font-bold">{userToDelete?.name} {userToDelete?.lastName}</span>.
                   </p>
                   <p className="text-red-500/70 text-[10px] font-black uppercase tracking-widest mt-4 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">
                      Esta acción borrará cursos, inscripciones y datos vinculados.
                   </p>
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Motivo de Eliminación</label>
                      <textarea 
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder="Ej: Violación de términos, solicitud del usuario..."
                        className="w-full bg-[#152035] border border-red-500/10 rounded-xl p-4 text-sm focus:outline-none focus:border-red-500 transition-all h-24 resize-none"
                      />
                   </div>

                   <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className="flex-1 py-3 rounded-xl border border-blue-500/10 hover:border-blue-500/30 text-xs font-bold transition-all uppercase"
                      >
                         Cancelar
                      </button>
                      <button 
                        onClick={handleDeleteUser}
                        disabled={isDeleting}
                        className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all uppercase shadow-xl shadow-red-600/20"
                      >
                         {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
       )}

        {/* MODAL DE CREACIÓN DE USUARIO (v7.0) */}
        {showCreateModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#070d1a]/90 backdrop-blur-xl" onClick={() => !isCreating && setShowCreateModal(false)} />
              
              <div className="relative bg-[#0d1524] border border-cyan-500/30 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-10 -mt-10" />
                 
                 <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-xl shadow-blue-600/20 rotate-3">
                       👤
                    </div>
                    <h2 className="text-2xl font-space-grotesk font-black text-white uppercase tracking-tighter">Crear Usuario Nuevo</h2>
                    <p className="text-gray-400 text-xs mt-2 font-medium">Registra alumnos, instructores o administradores manualmente.</p>
                 </div>

                 <form onSubmit={handleCreateUser} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-1">Nombre</label>
                          <input 
                            required
                            type="text" 
                            value={createForm.name}
                            onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                            placeholder="Ej: Juan"
                            className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-1">Apellidos</label>
                          <input 
                            type="text" 
                            value={createForm.lastName}
                            onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                            placeholder="Ej: Pérez"
                            className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-1">Email</label>
                       <input 
                         required
                         type="email" 
                         value={createForm.email}
                         onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                         placeholder="correo@ejemplo.com"
                         className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                       />
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-1">Password Temporal</label>
                       <input 
                         required
                         type="password" 
                         value={createForm.password}
                         onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                         placeholder="••••••••"
                         className="w-full bg-[#152035] border border-blue-500/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                       />
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-1">Rol de Usuario</label>
                       <div className="grid grid-cols-3 gap-2 p-1 bg-[#152035] rounded-2xl border border-white/5">
                          {[
                             { id: 'STUDENT', label: 'Alumno' },
                             { id: 'INSTRUCTOR', label: 'Instructor' },
                             { id: 'ADMIN', label: 'Admin' }
                          ].map(role => (
                             <button
                               key={role.id}
                               type="button"
                               onClick={() => setCreateForm({...createForm, role: role.id})}
                               className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${createForm.role === role.id ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
                             >
                                {role.label}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                       <button 
                         type="button"
                         onClick={() => setShowCreateModal(false)}
                         disabled={isCreating}
                         className="flex-1 py-4 rounded-2xl border border-white/5 hover:border-white/10 text-xs font-bold text-gray-400 transition-all uppercase tracking-widest"
                       >
                          Cancelar
                       </button>
                       <button 
                         type="submit"
                         disabled={isCreating}
                         className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-black text-xs font-black transition-all uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-[1.02]"
                       >
                          {isCreating ? 'Procesando...' : 'Crear Usuario'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}
    </div>
  );
}
