'use client';

import { useState, useEffect, Fragment } from 'react';
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
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
           const data = await res.json();
           setUserRole(data.role || null);
        }
      } catch (err) {
        console.error('Error fetching user for role check:', err);
      }
    };
    fetchUser();
  }, []);

  // Misión: Detalle de Alumnos por Curso v7.0
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

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

  const fetchStudents = async (courseId: string) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      setCourseStudents([]);
      return;
    }
    setExpandedCourseId(courseId);
    setIsStudentsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/students`);
      if (res.ok) {
        const data = await res.json();
        setCourseStudents(data);
      }
    } catch (err) {
      console.error('Error fetching course students:', err);
    } finally {
      setIsStudentsLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAdminHardDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`🛑 ATENCIÓN: Esta es una ELIMINACIÓN FÍSICA PERMANENTE de "${title}". Se borrarán módulos, lecciones, exámenes y progreso de todos los alumnos de forma irreversible. ¿Confirmar destrucción total?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      fetchCourses();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnrollment = async (courseId: string, studentId: string, studentEmail: string) => {
    if (!confirm(`¿Eliminar la inscripción de "${studentEmail}" de este curso? El alumno perderá acceso inmediato y su progreso será borrado físicamente.`)) return;
    
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/students?userId=${studentId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Inscripción eliminada ✓');
        fetchStudents(courseId);
        // Actualizar el contador en la tabla principal
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, _count: { ...c._count, enrollments: Math.max(0, c._count.enrollments - 1) } } : c));
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert(err.message);
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
                      <td colSpan={7} className="p-20 text-center text-gray-500 animate-pulse uppercase tracking-[0.2em] text-xs">Accediendo al catálogo maestro...</td>
                   </tr>
                ) : courses.map(course => (
                  <Fragment key={course.id}>
                    <tr className="hover:bg-blue-600/5 transition-colors group">
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
                          <button 
                            onClick={() => fetchStudents(course.id)}
                            className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl px-4 py-2 transition-all group/btn"
                          >
                            <div className="text-lg font-black text-gray-300 group-hover/btn:text-cyan-400">
                               {course._count.enrollments}
                            </div>
                            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Ver lista</div>
                          </button>
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
                          <div className="flex justify-end gap-2 flex-wrap max-w-[400px]">
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

                               {/* Eliminar (Hard Delete) - EXCLUSIVO ADMIN */}
                               {userRole === 'ADMIN' && (
                                 <button 
                                   onClick={() => handleAdminHardDeleteCourse(course.id, course.title)}
                                   className="px-3 py-1.5 rounded-lg text-[10px] font-black border border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest shadow-lg shadow-red-500/10"
                                 >
                                   🗑️ Eliminar
                                 </button>
                               )}
                          </div>
                       </td>
                    </tr>

                    {/* ACORDEÓN DE ALUMNOS (v7.0) */}
                    {expandedCourseId === course.id && (
                       <tr className="bg-cyan-500/[0.02] border-y border-cyan-500/10 animate-in slide-in-from-top duration-300">
                          <td colSpan={7} className="p-8">
                             <div className="bg-[#152035]/50 rounded-[2rem] border border-cyan-500/20 overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-cyan-500/10 flex justify-between items-center bg-cyan-500/5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-cyan-500/20">🎓</div>
                                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Alumnos Inscritos</h3>
                                   </div>
                                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{courseStudents.length} inscripciones totales</span>
                                </div>
                                
                                <div className="p-6">
                                   {isStudentsLoading ? (
                                      <div className="py-10 text-center text-xs text-gray-500 animate-pulse uppercase tracking-widest">Consultando registros de inscripción...</div>
                                   ) : courseStudents.length === 0 ? (
                                      <div className="py-10 text-center text-xs text-gray-600 italic">No hay alumnos inscritos en este curso todavía.</div>
                                   ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                         {courseStudents.map(student => (
                                            <div key={student.id} className="bg-[#070d1a] border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-cyan-500/30 transition-all group/student">
                                               <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-[10px] font-black text-blue-400 group-hover/student:bg-cyan-500 group-hover/student:text-black transition-all">
                                                     {student.name[0]}{student.lastName[0]}
                                                  </div>
                                                  <div>
                                                     <p className="text-xs font-bold text-gray-200">{student.name} {student.lastName}</p>
                                                     <p className="text-[9px] text-gray-500 font-mono">{student.email}</p>
                                                  </div>
                                               </div>
                                               <div className="flex items-center gap-3">
                                                  {userRole === 'ADMIN' && (
                                                    <button 
                                                      title="Expulsar alumno del curso"
                                                      onClick={() => handleDeleteEnrollment(course.id, student.id, student.email)}
                                                      className="w-6 h-6 flex items-center justify-center bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all transform active:scale-90"
                                                    >
                                                       <span className="font-bold leading-none">×</span>
                                                    </button>
                                                  )}
                                                  <div className="text-right">
                                                     <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Último acceso</p>
                                                     <p className={`text-[10px] font-black ${student.lastLoginAt ? 'text-cyan-400' : 'text-gray-700'}`}>
                                                        {student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleDateString() : 'NUNCA'}
                                                     </p>
                                                  </div>
                                               </div>
                                            </div>
                                         ))}
                                      </div>
                                   )}
                                </div>
                             </div>
                          </td>
                       </tr>
                    )}
                  </Fragment>
                ))}
                {(!loading && courses.length === 0) && (
                   <tr>
                      <td colSpan={7} className="p-20 text-center text-gray-500 italic">No hay cursos registrados en el catálogo.</td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
