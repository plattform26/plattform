'use client';

import { useState, useEffect } from 'react';
import { exportToCSV } from '@/lib/export-utils';

export default function AdminManualEnrollmentPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    lastName: '',
    courseId: '',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Cargar cursos para el select
    fetch('/api/admin/courses')
      .then(res => res.json())
      .then(setCourses);
    
    // Cargar historial
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await fetch('/api/admin/enrollments/manual');
    if (res.ok) setHistory(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/enrollments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
      setFormData({ email: '', name: '', lastName: '', courseId: '', reason: '', notes: '' });
      fetchHistory();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = history.map(h => ({
       'Fecha': new Date(h.createdAt).toLocaleString(),
       'Alumno': `${h.student.name} ${h.student.lastName}`,
       'Email': h.student.email,
       'Curso': h.course.title,
       'Motivo': h.reason,
       'Administrador': h.admin.name
    }));
    exportToCSV(exportData, 'plattform-inscripciones-manuales');
  };

  return (
    <div className="space-y-10">
       <div>
          <h1 className="text-3xl font-space-grotesk font-bold">Inscripción <span className="text-cyan-400">Manual</span></h1>
          <p className="text-gray-400 mt-2 font-light tracking-wide uppercase text-[10px] tracking-[0.2em]">Asignación directa de accesos sin pasarela de pagos.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORMULARIO */}
          <div className="bg-[#0d1524] border border-blue-500/10 p-10 rounded-3xl shadow-2xl">
             <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-cyan-400">Nuevos Accesos Directos</h2>
             
             {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-xs font-bold border transition-all animate-fade-in ${
                  message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
                }`}>
                   {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
                </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4">
                 {/* BÚSQUEDA DE USUARIO POR EMAIL */}
                 <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email del Alumno</label>
                    <div className="flex gap-2">
                       <input 
                         type="email" required placeholder="estudiante@email.com"
                         className="flex-1 bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-cyan-500 placeholder:text-gray-600"
                         value={formData.email} 
                         onChange={e => {
                            setFormData({...formData, email: e.target.value});
                            if (e.target.value.includes('@')) {
                               fetch(`/api/admin/users?q=${e.target.value}`)
                                 .then(res => res.json())
                                 .then(data => {
                                    if (data.users && data.users.length > 0) {
                                       const u = data.users.find((user: any) => user.email === e.target.value);
                                       if (u) setFormData(prev => ({...prev, name: u.name, lastName: u.lastName}));
                                    }
                                 });
                            }
                         }}
                       />
                    </div>
                    <p className="text-[9px] text-blue-500/60 italic ml-1">Si el correo existe, el sistema autocompletará el nombre.</p>
                 </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">(Si es nuevo) Nombre</label>
                      <input 
                        type="text" placeholder="Nombre"
                        className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Apellidos</label>
                      <input 
                        type="text" placeholder="Apellidos"
                        className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
                        value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-2 pt-4">
                   <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">Curso a Inscribir</label>
                   <select 
                     required className="w-full bg-[#152035] border border-cyan-500/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white cursor-pointer"
                     value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}
                   >
                      <option value="">-- Seleccionar curso --</option>
                      {courses.map(c => (
                         <option key={c.id} value={c.id}>{c.title} ({c.instructor.name})</option>
                      ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Motivo</label>
                   <input 
                     type="text" placeholder="Ej: Beca del 100%, Error en pago Stripe, etc."
                     className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                     value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}
                   />
                </div>

                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notas Internas</label>
                   <textarea 
                     className="w-full bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-gray-500 h-24 italic"
                     value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                   />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                >
                   {loading ? 'Generando Acceso...' : 'Confirmar Inscripción'}
                </button>
             </form>
          </div>

          {/* HISTORIAL */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-4 uppercase tracking-[0.1em]">Bitácora de Accesos</h2>
                <button onClick={handleExportCSV} className="text-[10px] font-bold text-gray-400 hover:text-white border border-gray-400/20 px-3 py-1.5 rounded-lg hover:bg-gray-400/10 transition-all tracking-widest uppercase">Exportar Bitácora</button>
             </div>

             <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600/20">
                {history.length === 0 ? (
                   <p className="text-center text-gray-600 py-10 italic">No hay registros de inscripciones manuales aún.</p>
                ) : history.map((h, i) => (
                   <div key={i} className="bg-[#0d1524] border border-blue-500/10 p-5 rounded-2xl hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-black text-blue-500/80 bg-blue-500/10 px-2 py-0.5 rounded tracking-widest">{new Date(h.createdAt).toLocaleDateString()}</span>
                         <span className="text-[8px] text-gray-600 font-mono italic">Por: {h.admin.name}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors uppercase leading-tight">{h.student.email}</p>
                      <p className="text-xs text-gray-500 font-medium mb-3">📚 {h.course.title}</p>
                      {h.reason && (
                         <div className="pt-3 border-t border-blue-500/5">
                            <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Motivo:</p>
                            <p className="text-xs text-gray-400 italic">"{h.reason}"</p>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}
