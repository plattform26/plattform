'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMXN, formatAmount } from '@/lib/utils/currency';

export default function AdminUserDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const { id } = params;
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<any>({});
    const [msg, setMsg] = useState('');

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            setUser(data);
            setForm({
                name: data?.name || '',
                lastName: data?.lastName || '',
                email: data?.email || '',
                specialty: data?.specialty || '',
                role: data?.role || 'STUDENT',
                password: '',
                status: data?.status || 'ACTIVE',
                academyName: data?.instructorProfile?.academyName || '',
                slug: data?.instructorProfile?.slug || '',
                planId: data?.instructorProfile?.subscriptions?.[0]?.plan?.name || ''
            });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al capturar datos del usuario:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchUser();
    }, [id]);

    const handleSave = async () => {
      setSaving(true);
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
            credentials: 'include'
        });
        if (res.ok) {
            setMsg('✓ Usuario actualizado con éxito');
            setIsEditing(false);
            fetchUser();
            setTimeout(() => setMsg(''), 3000);
        } else {
            const err = await res.json();
            alert(err.error || 'Error al guardar');
        }
      } catch (err) {
        alert('Error de conexión al servidor');
      } finally {
        setSaving(false);
      }
    };

    const handleUpdatePlan = async () => {
      if (!form.planId) return alert('Selecciona un plan');
      setSaving(true);
      try {
        const res = await fetch(`/api/admin/instructors/${user?.instructorProfile?.id}/manage-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId: form.planId }),
            credentials: 'include'
        });
        if (res.ok) {
            setMsg('✓ Plan actualizado correctamente');
            fetchUser();
            setTimeout(() => setMsg(''), 3000);
        }
      } catch (err) {
        alert('Error al actualizar plan');
      } finally {
        setSaving(false);
      }
    };

    if (loading) return <div className="p-20 text-center text-gray-500 animate-pulse uppercase tracking-[0.3em] text-[10px]">Descifrando Perfil Maestro...</div>;
    if (!user) return <div className="p-20 text-center text-red-400 font-black tracking-widest uppercase">ERROR: NODO NO ENCONTRADO O ERROR DE RED</div>;

    return (
      <div className="space-y-12 animate-fade-in font-poppins pb-32 max-w-7xl mx-auto">
         {msg && <div className="fixed top-24 right-8 z-[200] bg-cyan-500 text-white font-black text-[10px] px-8 py-4 rounded-2xl shadow-2xl shadow-cyan-500/40 animate-bounce uppercase tracking-widest">{msg}</div>}

         {/* APP BAR / ACTION BAR */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <Link href="/dashboard/admin/users" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all hover:bg-cyan-500/10 group">
                  <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
               </Link>
               <div>
                  <h1 className="text-3xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Super Poderes: <span className="text-cyan-400">Admin Master</span></h1>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 italic">Control absoluto sobre la identidad y privilegios del usuario.</p>
               </div>
            </div>

            <div className="flex gap-4 items-center">
              {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-[10px] font-black text-white hover:scale-105 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest"
                  >
                    ✏️ Editar Perfil Completo
                  </button>
              ) : (
                  <div className="flex gap-4">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-green-500 rounded-2xl text-[10px] font-black text-black hover:scale-105 transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest"
                      >
                        {saving ? 'Guardando...' : '💾 Confirmar Cambios'}
                      </button>
                  </div>
              )}
              <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${user?.status === 'ACTIVE' ? 'text-green-400 border-green-500/20 bg-green-400/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
                  {user?.status}
              </span>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* COLUMNA IZQUIERDA: IDENTIDAD */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl text-center relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                  
                  <div className="relative z-10">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-4xl font-black text-white shadow-3xl shadow-blue-600/30 mx-auto mb-8 border-4 border-white/10">
                         {user?.name?.[0]}{user?.lastName?.[0]}
                      </div>
                      
                      {isEditing ? (
                          <div className="space-y-4 text-left">
                              <div>
                                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block italic text-center">Nombres y Apellidos</label>
                                  <div className="grid grid-cols-2 gap-2">
                                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-cyan-500 outline-none" />
                                      <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-cyan-500 outline-none" />
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block italic text-center">Email Maestro</label>
                                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-cyan-400 font-mono text-center outline-none focus:border-cyan-500" />
                              </div>
                              <div>
                                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block italic text-center">Especialidad Profesional</label>
                                  <input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white text-center outline-none focus:border-cyan-500" placeholder="Ej. Desarrollador Web..." />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div>
                                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block italic text-center">Privilegio (Rol)</label>
                                      <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white text-center outline-none focus:border-cyan-500 appearance-none uppercase font-black">
                                          <option value="STUDENT">STUDENT</option>
                                          <option value="INSTRUCTOR">INSTRUCTOR</option>
                                          <option value="ADMIN">ADMIN</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block italic text-center">Estado del Nodo</label>
                                      <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white text-center outline-none focus:border-cyan-500 appearance-none uppercase font-black">
                                          <option value="ACTIVE">ACTIVO</option>
                                          <option value="SUSPENDED">SUSPENDIDO</option>
                                      </select>
                                  </div>
                              </div>
                              <div className="pt-2 text-center">
                                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block italic text-center">🔐 Reset Password (Opcional)</label>
                                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Nueva contraseña maestra..." className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white text-center outline-none focus:border-cyan-500 placeholder:text-gray-700" />
                              </div>
                          </div>
                      ) : (
                          <>
                              <h2 className="text-3xl font-space-grotesk font-black text-white italic tracking-tighter">{user?.name} {user?.lastName}</h2>
                              <p className="text-gray-500 text-xs mt-2 font-mono italic">{user?.email}</p>
                              <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4 text-left">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Rol de Acceso</span>
                                    <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-400/20 tracking-widest uppercase">{user?.role}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Fecha Registro</span>
                                    <span className="text-xs text-gray-400 font-mono italic">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                 </div>
                              </div>
                          </>
                      )}
                  </div>
               </div>

               {/* ACADEMIA (Si el rol seleccionado es INSTRUCTOR) */}
               {(form?.role === 'INSTRUCTOR' || user?.role === 'INSTRUCTOR') && (
                    <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl">
                       <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 italic text-center">Marca Educativa</h3>
                       <div className="space-y-6">
                          <div>
                              <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block italic">Identificador (Slug)</label>
                              {isEditing ? (
                                  <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-cyan-400 font-mono" />
                              ) : (
                                  <p className="text-xs text-cyan-400 font-mono tracking-widest hover:text-white transition-colors">/{user?.instructorProfile?.slug || 'sin-slug'}</p>
                              )}
                          </div>
                          <div>
                              <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block italic">Nombre Académico</label>
                              {isEditing ? (
                                  <input value={form.academyName} onChange={e => setForm({...form, academyName: e.target.value})} className="w-full bg-[#070d1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" />
                              ) : (
                                  <p className="text-xs text-gray-200 font-bold uppercase tracking-tight">{user?.instructorProfile?.academyName || 'No asignado'}</p>
                              )}
                          </div>
                       </div>
                    </div>
               )}
            </div>

            {/* COLUMNA DERECHA: RECURSOS Y GESTIÓN */}
            <div className="lg:col-span-8 space-y-10">
               {/* GESTIÓN DE PLANES (Solo Instructores) */}
               {user?.role === 'INSTRUCTOR' && (
                  <div className="bg-[#0d1524] border border-cyan-500/10 p-10 rounded-[3rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-10 text-8xl opacity-[0.03] grayscale group-hover:grayscale-0 transition-all duration-700 select-none">💎</div>
                      
                      <div className="relative z-10">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-white/5">
                              <div>
                                  <h3 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Gestión de <span className="text-cyan-400">Suscripción</span></h3>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Nivel de recursos asignados al instructor</p>
                              </div>
                              <div className="flex gap-4 w-full md:w-auto">
                                  <select 
                                      value={form.planId}
                                      onChange={e => setForm({...form, planId: e.target.value})}
                                      className="flex-1 md:w-48 bg-[#070d1a] border border-cyan-500/30 rounded-2xl px-5 py-3 text-[10px] font-black text-cyan-400 uppercase tracking-widest outline-none focus:border-cyan-400 shadow-2xl"
                                  >
                                      <option value="">Seleccionar Plan...</option>
                                      <option value="starter">Starter</option>
                                      <option value="growth">Growth</option>
                                      <option value="scale">Scale</option>
                                  </select>
                                  <button 
                                      onClick={handleUpdatePlan}
                                      disabled={saving}
                                      className="px-6 py-3 bg-cyan-600 rounded-2xl text-[10px] font-black text-white hover:scale-105 transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-widest"
                                  >
                                      {saving ? '...' : '🔄 Actualizar'}
                                  </button>
                              </div>
                          </div>

                          {user?.instructorProfile?.subscriptions?.[0] ? (() => {
                               const sub = user.instructorProfile.subscriptions[0];
                               const capacityNodes = user.courses?.reduce((acc: number, c: any) => acc + (c._count?.enrollments || 0), 0) || 0;
                               const limit = sub.plan.studentLimit;
                               const usagePercent = limit > 0 ? Math.min(Math.round((capacityNodes / limit) * 100), 100) : 100;

                               return (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                       <div className="space-y-8">
                                           <div className="flex items-center gap-6">
                                               <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-3xl shadow-2xl">⚡</div>
                                               <div>
                                                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">Nivel Seleccionado</p>
                                                   <p className="text-2xl font-black text-white uppercase tracking-tighter italic">{sub.plan.displayName}</p>
                                               </div>
                                           </div>
                                           <div className="bg-[#0D1524] p-6 rounded-3xl border border-white/5 space-y-4">
                                               <div className="flex justify-between items-end">
                                                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">Capacidad de Nodos (Alumnos-Materia)</span>
                                                   <span className={`text-sm font-black font-mono ${usagePercent > 90 ? 'text-red-400' : 'text-cyan-400'}`}>
                                                       {capacityNodes} / {limit}
                                                   </span>
                                               </div>
                                               <div className="h-2.5 w-full bg-black/40 rounded-full p-0.5 border border-white/5 overflow-hidden">
                                                   <div 
                                                       className={`h-full transition-all duration-1000 rounded-full ${usagePercent > 90 ? 'bg-red-500 shadow-lg shadow-red-500/40' : 'bg-cyan-500 shadow-lg shadow-cyan-500/40'}`}
                                                       style={{ width: `${usagePercent}%` }}
                                                   />
                                               </div>
                                           </div>
                                       </div>
                                      <div className="bg-[#070d1a] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 italic">Estado de Red</p>
                                                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${sub.status === 'ACTIVE' ? 'text-green-400 border-green-500/30 bg-green-400/5' : 'text-red-400 border-red-500/30 bg-red-500/5'}`}>{sub.status}</span>
                                              </div>
                                              <div className="text-right">
                                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">Vencimiento</p>
                                                  <p className="text-xs text-gray-300 font-mono font-bold">{sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'PERMANENTE'}</p>
                                              </div>
                                          </div>
                                          <div className="mt-8 pt-6 border-t border-white/5">
                                              <div className="flex justify-between items-center italic">
                                                  <span className="text-[9px] text-gray-600 uppercase font-black">ID Transacción</span>
                                                  <span className="text-[9px] text-gray-500 font-mono">{sub.stripeSubscriptionId || 'CORTESÍA ADMIN'}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                               );
                          })() : (
                              <div className="p-16 border-4 border-dashed border-red-500/10 rounded-[3rem] text-center bg-red-500/5 animate-pulse">
                                  <span className="text-5xl mb-6 block">⚠️</span>
                                  <h4 className="text-xs font-black text-red-400 uppercase tracking-[0.3em]">Nodo sin Suscripción</h4>
                                  <p className="text-gray-600 text-[10px] mt-2 italic font-medium">Asigna un plan manualmente para activar los recursos del instructor.</p>
                              </div>
                          )}
                      </div>
                  </div>
               )}

               {/* BITÁCORA FINANCIERA */}
               <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl">
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Bitácora <span className="text-cyan-400">Financiera</span></h3>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic mb-1">
                            {user?.role === 'INSTRUCTOR' ? 'Rentabilidad Generada' : 'Inversión Total'}
                         </p>
                         <p className="text-2xl font-black text-white font-mono">
                            {user?.role === 'INSTRUCTOR' 
                               ? formatAmount(user?.transactions?.reduce((acc: number, t: any) => acc + Number(t.netAmountToInstructor || 0), 0) || 0)
                               : formatAmount(user?.transactions?.reduce((acc: number, t: any) => acc + Number(t.grossAmount || 0), 0) || 0)
                            } <span className="text-xs text-gray-500">MXN</span>
                         </p>
                      </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-white/5 border-b border-white/5">
                              <tr>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500">Producto</th>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500">Fecha</th>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500">Monto</th>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500 text-right">Estado</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {user?.transactions?.map((tx: any) => (
                                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                      <td className="p-4">
                                          <p className="text-xs font-bold text-gray-300 group-hover:text-cyan-400 transition-colors uppercase truncate w-40">{tx.course?.title || 'Suscripción'}</p>
                                          <p className="text-[8px] text-gray-600 font-mono italic">{tx.id.slice(-8).toUpperCase()}</p>
                                      </td>
                                      <td className="p-4 text-xs text-gray-500 font-mono">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                      <td className="p-4">
                                          <p className="text-xs font-black text-white">{formatMXN(tx.grossAmount)}</p>
                                      </td>
                                      <td className="p-4 text-right">
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${tx.paymentStatus === 'SUCCESS' ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'}`}>{tx.paymentStatus}</span>
                                      </td>
                                  </tr>
                              ))}
                              {(!user?.transactions || user?.transactions.length === 0) && (
                                  <tr>
                                      <td colSpan={4} className="p-10 text-center text-gray-700 italic uppercase text-[9px] tracking-widest">Sin movimientos financieros</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
               </div>

               {/* AUDITORÍA DE SUSCRIPCIONES (History) */}
               <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl">
                  <h3 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter mb-8">Auditoría de <span className="text-cyan-400">Suscripciones</span></h3>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-white/5 border-b border-white/5">
                              <tr>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500 italic">Plan</th>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500 italic">Período</th>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500 italic text-center">Estado</th>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500 italic">Monto Pagado</th>
                                  <th className="p-4 text-[9px] font-black uppercase text-gray-500 italic">ID Stripe</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {user?.subscriptionRecords?.map((record: any) => (
                                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                      <td className="p-4">
                                          <p className="text-xs font-bold text-white uppercase italic">{record.plan.displayName}</p>
                                          <p className="text-[8px] text-gray-600 font-mono italic uppercase">ID: {record.id.slice(-6)}</p>
                                      </td>
                                      <td className="p-4">
                                          <div className="flex flex-col">
                                              <span className="text-[10px] text-gray-400 font-mono italic">{new Date(record.startDate).toLocaleDateString()}</span>
                                              <span className="text-[8px] text-gray-600 font-mono">→ {record.endDate ? new Date(record.endDate).toLocaleDateString() : 'Activo'}</span>
                                          </div>
                                      </td>
                                      <td className="p-4 text-center">
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                              record.status === 'ACTIVE' ? 'text-green-400 border-green-500/20 bg-green-400/5' :
                                              record.status === 'EXPIRED' ? 'text-gray-500 border-white/10 bg-white/5' :
                                              'text-red-400 border-red-500/20'
                                          }`}>
                                              {record.status}
                                          </span>
                                      </td>
                                      <td className="p-4">
                                          <p className="text-xs font-black text-white font-mono">{formatAmount(record.amountPaid)} <span className="text-[8px] text-gray-600">MXN</span></p>
                                      </td>
                                      <td className="p-4">
                                          <p className="text-[8px] text-gray-500 font-mono italic truncate w-32" title={record.stripeSubscriptionId}>
                                              {record.stripeSubscriptionId || 'N/A'}
                                          </p>
                                      </td>
                                  </tr>
                              ))}
                              {(!user?.subscriptionRecords || user?.subscriptionRecords.length === 0) && (
                                  <tr>
                                      <td colSpan={5} className="p-10 text-center text-gray-700 italic uppercase text-[9px] tracking-widest animate-pulse">Sin registros históricos</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
               </div>

               {/* PRODUCCIÓN ACADÉMICA / CURSOS */}
               <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl">
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Inscripciones / <span className="text-cyan-400">Portafolio</span></h3>
                      <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">{user?.role === 'INSTRUCTOR' ? (user?.courses?.length || 0) : (user?.enrollments?.length || 0)} Registros</span>
                  </div>
                  <div className="space-y-4">
                      {(user?.role === 'INSTRUCTOR' ? user?.courses : user?.enrollments?.map((e: any) => e.course))?.map((course: any) => (
                          <div key={course.id} className="bg-[#070d1a] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-cyan-500/30 transition-all group">
                               <div className="flex items-center gap-6 w-full md:w-auto">
                                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 overflow-hidden flex-shrink-0 group-hover:border-cyan-500 transition-colors">
                                      {course.thumbnailUrl ? <img src={course.thumbnailUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl grayscale">📖</div>}
                                  </div>
                                  <div>
                                      <Link href={`/dashboard/instructor/courses/${course.id}/builder`} target="_blank" className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{course.title}</Link>
                                      <div className="flex gap-3 mt-2">
                                          <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg border-2 ${course.status === 'PUBLISHED' ? 'text-green-400 border-green-500/20' : 'text-orange-400 border-orange-500/20'}`}>{course.status}</span>
                                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5 italic">{course.category}</span>
                                      </div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                  <div className="text-center md:text-right">
                                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic mb-1">Inscritos</p>
                                      <p className="text-xl font-black text-white font-mono">{course._count?.enrollments || 0}</p>
                                  </div>
                                  <div className="text-center md:text-right">
                                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic mb-1">Costo Unitario</p>
                                      <p className="text-sm font-black text-white font-mono">{formatMXN(course.price)}</p>
                                  </div>
                                  <button 
                                      onClick={() => alert('Moderación activa')}
                                      className="w-10 h-10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
                                  >
                                      🗑️
                                  </button>
                               </div>
                          </div>
                      ))}
                      {((user?.role === 'INSTRUCTOR' && (!user?.courses || user?.courses?.length === 0)) || (user?.role === 'STUDENT' && (!user?.enrollments || user?.enrollments?.length === 0))) && (
                          <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/5">
                              <p className="text-gray-600 uppercase font-black text-[10px] tracking-[0.3em] italic">Sin Actividad Académica Registrada</p>
                          </div>
                      )}
                  </div>
               </div>
            </div>
         </div>

         <style jsx global>{`
             .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
             @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
             .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7); }
         `}</style>
      </div>
    );
}
