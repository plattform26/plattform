'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form State
  const [form, setForm] = useState({
    code: '',
    discountPercent: 15,
    usageLimit: '',
    expirationDate: '',
    courseId: '' // Opcional
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [couponsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/coupons'),
        fetch('/api/admin/courses') // Necesitamos listar cursos para la restricción
      ]);

      if (couponsRes.ok) setCoupons(await couponsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMsg = (text: string, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          courseId: form.courseId || null
        })
      });

      if (res.ok) {
        showMsg('✓ Cupón creado y sincronizado con Stripe');
        setForm({ code: '', discountPercent: 15, usageLimit: '', expirationDate: '', courseId: '' });
        fetchData();
      } else {
        const err = await res.json();
        showMsg(err.error || 'Error al crear cupón', 'error');
      }
    } catch (err) {
      showMsg('Error de conexión', 'error');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      }
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar cupón? Esto también lo eliminará de Stripe.')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        showMsg('Cupón eliminado');
      }
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {msg.text && (
        <div className={`fixed top-24 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest animate-bounce ${
          msg.type === 'success' ? 'bg-cyan-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-space-grotesk font-black italic tracking-tighter uppercase">Cerebro de <span className="text-cyan-400">Cupones</span></h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Gestión inteligente de descuentos y sincronización con Stripe.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* FORMULARIO DE CREACIÓN */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-[3rem] shadow-3xl">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-8 italic">Nuevo Código Maestro</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block italic tracking-widest">Código (ej. VERANO2025)</label>
                <input 
                  required
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="MAYÚSCULAS"
                  className="w-full bg-[#070d1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-cyan-400 font-mono outline-none focus:border-cyan-500 transition-all uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block italic tracking-widest">% Descuento</label>
                  <input 
                    type="number" required min="1" max="100"
                    value={form.discountPercent}
                    onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    className="w-full bg-[#070d1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block italic tracking-widest">Límite Usos</label>
                  <input 
                    type="number" placeholder="∞"
                    value={form.usageLimit}
                    onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full bg-[#070d1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block italic tracking-widest">Restricción de Curso</label>
                <select 
                  value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className="w-full bg-[#070d1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none focus:border-cyan-500 appearance-none uppercase font-bold"
                >
                  <option value="">🌎 Global (Todos los cursos)</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>📖 {c.title}</option>
                  ))}
                </select>
                <p className="text-[8px] text-gray-600 mt-2 italic">Si no seleccionas un curso, el cupón será válido en toda la plataforma.</p>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block italic tracking-widest">Fecha Expiración</label>
                <input 
                  type="date"
                  value={form.expirationDate}
                  onChange={e => setForm({ ...form, expirationDate: e.target.value })}
                  className="w-full bg-[#070d1a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <button 
                type="submit" disabled={creating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl text-[10px] font-black text-white hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {creating ? 'Sincronizando con Stripe...' : '🚀 Desplegar Cupón'}
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO DE CUPONES */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-[#0d1524] border border-blue-500/10 rounded-[3rem] shadow-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                       <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Código / ID Stripe</th>
                       <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Descuento</th>
                       <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Alcance / Curso</th>
                       <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic text-center">Usos / Límite</th>
                       <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic text-right">Acciones</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center animate-pulse text-[10px] font-black uppercase text-gray-600 tracking-widest italic">Compilando registros maestros...</td>
                      </tr>
                    ) : coupons.map(coupon => (
                      <tr key={coupon.id} className="hover:bg-white/5 transition-all group">
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-xs">
                                  {coupon.discountPercent}%
                               </div>
                               <div>
                                  <p className="font-mono text-sm font-black text-white tracking-widest">{coupon.code}</p>
                                  <p className="text-[8px] text-gray-600 font-mono uppercase">Stripe: {coupon.stripeCouponId || 'N/A'}</p>
                                </div>
                            </div>
                         </td>
                         <td className="p-6">
                            <span className="text-xl font-black text-white italic">-{coupon.discountPercent}%</span>
                         </td>
                         <td className="p-6">
                            {coupon.courseId ? (
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded border border-blue-400/10 uppercase tracking-tighter">Curso Específico</span>
                                <p className="text-[10px] text-gray-400 font-bold truncate w-40 italic">{coupon.course?.title}</p>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-green-400 bg-green-400/5 px-2 py-0.5 rounded border border-green-500/10 uppercase tracking-widest">Global (Platform)</span>
                            )}
                         </td>
                         <td className="p-6 text-center">
                            <div className="flex flex-col items-center">
                               <p className="text-lg font-black text-white font-mono">{coupon._count?.usages || 0}</p>
                               <p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">de {coupon.usageLimit || '∞'}</p>
                            </div>
                         </td>
                         <td className="p-6 text-right space-x-2">
                             <button 
                               onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                 coupon.isActive 
                                 ? 'text-green-400 border-green-500/20 bg-green-500/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
                                 : 'text-gray-500 border-white/10 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'
                               }`}
                             >
                               {coupon.isActive ? 'ACTIVO' : 'PAUSADO'}
                             </button>
                             <button 
                               onClick={() => handleDelete(coupon.id)}
                               className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                             >
                               🗑️
                             </button>
                         </td>
                      </tr>
                    ))}
                    {!loading && coupons.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-gray-700 italic uppercase text-[9px] font-black tracking-widest">Sin códigos de descuento en línea</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
