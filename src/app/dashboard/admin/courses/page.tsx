'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { exportToCSV, exportToExcel } from '@/lib/export-utils';
import StarRating from '@/components/StarRating';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const router = useRouter();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('q', search);
      if (statusFilter) q.append('status', statusFilter);
      
      const res = await fetch(`/api/admin/courses?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchCourses();
    } catch (err) {
      console.error('Error updating course status:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm('¿Deseas duplicar este curso? Se creará una copia en estado BORRADOR.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/instructor/courses/${id}/duplicate`, {
        method: 'POST'
      });
      if (res.ok) {
        const newCourse = await res.json();
        router.push(`/dashboard/admin/courses/${newCourse.id}/modules`);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al duplicar el curso');
      }
    } catch (err) {
      console.error('Error duplicating course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleExportCSV = () => {
    const exportData = courses.map(c => ({
       ID: c.id,
       Título: c.title,
       Instructor: `${c.instructor.name} ${c.instructor.lastName}`,
       Categoría: c.category,
       Estado: c.status,
       Alumnos: c._count.enrollments,
       Precio: `$${c.price} ${c.currency}`,
       'Creado El': new Date(c.createdAt).toLocaleDateString()
    }));
    exportToCSV(exportData, 'plattform-cursos-2025');
  };

  const handleExportExcel = () => {
    const exportData = courses.map(c => ({
       ID: c.id,
       Título: c.title,
       Instructor: `${c.instructor.name} ${c.instructor.lastName}`,
       Categoría: c.category,
       Estado: c.status,
       Alumnos: c._count.enrollments,
       Precio: `$${c.price} ${c.currency}`,
       'Creado El': new Date(c.createdAt).toLocaleDateString()
    }));
    exportToExcel(exportData, 'plattform-cursos-2025', 'Cursos');
  };

  const getStatusBadge = (status: string) => {
     const styles: any = {
        PUBLISHED: 'text-green-400 bg-green-400/10 border-green-400/20',
        DRAFT: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        HIBERNATED: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        ARCHIVED: 'text-red-400 bg-red-400/10 border-red-400/20',
     };
     const labels: any = {
        PUBLISHED: 'PUBLICADO',
        DRAFT: 'BORRADOR',
        HIBERNATED: 'OCULTO',
        ARCHIVED: 'ARCHIVADO',
     };
     return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${styles[status] || styles.DRAFT}`}>
           {labels[status] || status}
        </span>
     );
  };

  return (
    <div className="space-y-10 font-poppins">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-space-grotesk font-bold">Catálogo de <span className="text-cyan-400">Cursos</span></h1>
             <p className="text-gray-400 mt-2 font-light tracking-wide italic">Supervisión de contenido y cumplimiento.</p>
          </div>
          
          <div className="flex gap-3">
              <Link 
                href="/dashboard/instructor/courses/new" 
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all uppercase tracking-widest leading-none flex items-center gap-2"
              >
                <span>➕</span> Crear Curso
              </Link>
              <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-blue-500/10 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all uppercase tracking-widest leading-none">Exportar CSV</button>
              <button onClick={handleExportExcel} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0d1524] border border-green-500/10 hover:border-green-500/50 hover:bg-green-600/10 transition-all uppercase tracking-widest leading-none">Exportar Excel</button>
           </div>
       </div>

       {/* FILTROS ARRIBA DE TABLA */}
       <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#0d1524]/50 border border-blue-500/10 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex gap-2">
             <select 
               className="bg-[#152035] border border-blue-500/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-cyan-500 text-gray-400"
               onChange={e => setStatusFilter(e.target.value)}
               value={statusFilter}
             >
                <option value="">TODOS LOS ESTADOS</option>
                <option value="PUBLISHED">PUBLICADOS</option>
                <option value="DRAFT">BORRADORES</option>
                <option value="HIBERNATED">HIBERNADOS</option>
                <option value="ARCHIVED">ARCHIVADOS</option>
             </select>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
             <input 
               type="text" 
               placeholder="🔍 Título o Instructor..." 
               className="w-full md:w-80 bg-[#152035] border border-blue-500/10 rounded-xl px-5 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
             <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 uppercase tracking-widest">Filtrar</button>
          </form>
       </div>

       {/* TABLA DE CURSOS */}
       <div className="bg-[#0d1524] border border-blue-500/10 rounded-3xl shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead className="bg-[#152035]/50 border-b border-blue-500/10">
                <tr>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Curso / Instructor</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Categoría</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Estado</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Alumnos</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Reputación</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400">Precio</th>
                   <th className="p-6 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-blue-500/5">
                {loading ? (
                   <tr>
                      <td colSpan={6} className="p-20 text-center text-gray-500 animate-pulse uppercase tracking-[0.2em] text-xs">Accediendo al catálogo maestro...</td>
                   </tr>
                ) : courses.map(course => (
                   <tr key={course.id} className="hover:bg-blue-600/5 transition-colors group">
                      <td className="p-6">
                         <div>
                            <p className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors uppercase text-sm tracking-tight">{course.title}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">{course.instructor.name} {course.instructor.lastName}</p>
                         </div>
                      </td>
                      <td className="p-6">
                         <span className="text-[10px] font-bold text-gray-400 bg-gray-400/5 px-2 py-0.5 rounded border border-gray-400/10 uppercase tracking-tighter">
                            {course.category}
                         </span>
                      </td>
                      <td className="p-6">
                         {getStatusBadge(course.status)}
                      </td>
                      <td className="p-6 text-center">
                         <div className="text-lg font-black text-gray-300">
                            {course._count.enrollments}
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col items-start gap-1">
                            <StarRating value={course.avgRating || 0} readonly size="sm" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                               {course.ratingCount || 0} evaluaciones
                            </span>
                         </div>
                      </td>
                      <td className="p-6">
                         <span className="text-sm font-bold text-cyan-400/80">${Number(course.price).toLocaleString()}</span>
                      </td>
                      <td className="p-6 text-right">
                         <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity flex-wrap max-w-[400px]">
                             {/* Vista Previa */}
                             <Link 
                                href={`/dashboard/student/learn/${course.id}?preview=true`} 
                                target="_blank"
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black border border-green-500/20 hover:border-green-500/80 hover:bg-green-500/10 transition-all text-green-400/80 hover:text-white uppercase tracking-widest"
                             >
                                👁️ Vista Previa
                             </Link>

                             {/* Constructor */}
                             <Link 
                                href={`/dashboard/admin/courses/${course.id}/modules`} 
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black border border-cyan-500/20 hover:border-cyan-500/80 hover:bg-cyan-500/10 transition-all text-cyan-400/80 hover:text-white uppercase tracking-widest"
                             >
                                CONSTRUCTOR 🛠️
                             </Link>
                            
                             {/* Estados */}
                             {course.status === 'PUBLISHED' ? (
                                <button 
                                  onClick={() => handleStatusChange(course.id, 'HIBERNATED')}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-400/80 hover:text-yellow-400 transition-all uppercase"
                                  title="Ocultar del catálogo"
                                >
                                  ❄️ Hibernar
                                </button>
                             ) : (
                                <button 
                                  onClick={() => handleStatusChange(course.id, 'PUBLISHED')}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-green-500/20 hover:bg-green-500/10 text-green-400/80 hover:text-green-400 transition-all uppercase"
                                >
                                  🔥 Publicar
                                </button>
                             )}

                             {/* Duplicar */}
                             <button 
                                onClick={() => handleDuplicate(course.id)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-blue-500/20 hover:bg-blue-500/10 text-blue-400/80 hover:text-blue-400 transition-all uppercase"
                                title="Clonar este curso"
                             >
                                📑 Duplicar
                             </button>

                             {/* Eliminar */}
                             {course.status !== 'ARCHIVED' && (
                                <button 
                                  onClick={() => handleStatusChange(course.id, 'ARCHIVED')}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-500/20 hover:bg-red-500/10 text-red-400/80 hover:text-red-400 transition-all uppercase"
                                >
                                  🗑️ Eliminar
                                </button>
                             )}
                         </div>
                      </td>
                   </tr>
                ))}
                {(!loading && courses.length === 0) && (
                   <tr>
                      <td colSpan={6} className="p-20 text-center text-gray-500 italic">No hay cursos registrados en el catálogo.</td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
