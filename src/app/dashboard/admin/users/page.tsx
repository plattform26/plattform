'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { exportToCSV, exportToExcel } from '@/lib/export-utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>(''); // Default: All
  const [search, setSearch] = useState<string>('');
  const [plans, setPlans] = useState<any[]>([]);

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
       'Registrado El': new Date(u.createdAt).toLocaleDateString()
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
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Cortesía</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Fecha Reg</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-blue-500/5">
                {loading ? (
                   <tr>
                      <td colSpan={8} className="p-20 text-center text-gray-500 animate-pulse">Cargando base de datos de usuarios...</td>
                   </tr>
                ) : users.map(user => (
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
                            <div className="flex flex-col gap-2">
                               <label className="flex items-center gap-2 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={user.isCourtesy}
                                    onChange={(e) => handleUpdateUser(user.id, { isCourtesy: e.target.checked })}
                                    className="w-4 h-4 rounded border-blue-500/30 bg-blue-500/10 checked:bg-cyan-500 transition-all cursor-pointer"
                                  />
                                  <span className={`text-[10px] font-black uppercase tracking-tighter ${user.isCourtesy ? 'text-cyan-400' : 'text-gray-600'}`}>
                                     {user.isCourtesy ? 'Habilitada' : 'No activa'}
                                  </span>
                               </label>
                               
                               {user.isCourtesy && (
                                  <select
                                    value={user.courtesyPlanId || ''}
                                    onChange={(e) => handleUpdateUser(user.id, { courtesyPlanId: e.target.value })}
                                    className="bg-[#152035] border border-cyan-500/20 rounded-lg px-2 py-1 text-[9px] font-bold text-cyan-200 focus:outline-none focus:border-cyan-500 transition-all uppercase tracking-widest"
                                  >
                                     <option value="">Seleccionar Plan</option>
                                     {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.displayName}</option>
                                     ))}
                                  </select>
                               )}
                            </div>
                         ) : (
                            <span className="text-gray-700 font-black text-[9px] tracking-widest uppercase">N/A</span>
                         )}
                      </td>
                      <td className="p-6 text-sm text-gray-500 font-medium whitespace-nowrap">
                         {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right min-w-[300px]">
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
                         </div>
                      </td>
                   </tr>
                ))}
                {(!loading && users.length === 0) && (
                   <tr>
                      <td colSpan={8} className="p-20 text-center text-gray-500 italic">No se encontraron usuarios con estos criterios.</td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
