export const dynamic = 'force-dynamic';
'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCourseId = searchParams.get('courseId') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, eRes] = await Promise.all([
          fetch('/api/instructor/courses'),
          fetch(`/api/instructor/enrollments?courseId=${selectedCourseId}`)
        ]);
        
        // Error defense: Don't redirect or crash if data is empty or fetch fails non-critically
        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(Array.isArray(cData) ? cData : []);
        }
        
        if (eRes.ok) {
          const eData = await eRes.json();
          setGroupedStudents(Array.isArray(eData) ? eData : []);
        } else {
          console.error('Enrollment fetch failed with status:', eRes.status);
          setGroupedStudents([]); // Ensure it's an empty array to avoid redirect-like behavior
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setGroupedStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCourseId]);

  const handleFilterChange = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set('courseId', id);
    else params.delete('courseId');
    router.push(`/dashboard/instructor/students?${params.toString()}`);
    setIsDropdownOpen(false);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const filterLabel = selectedCourse ? selectedCourse.title : 'TODOS MIS CURSOS';

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return groupedStudents;
    return (groupedStudents || []).filter(s => {
        const fullUserName = `${s.user.name} ${s.user.lastName}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullUserName.includes(search);
    });
  }, [groupedStudents, searchTerm]);

  const formatGlobalDate = (dateString: string | null) => {
    if (!dateString) return 'Sincronizando...';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
                 .replace(/^\w/, (c) => c.toUpperCase());
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
     return <div className="p-20 text-center text-gray-500 animate-pulse uppercase tracking-[0.3em] text-[10px]">Sincronizando Base de Alumnos...</div>;
  }

  return (
    <div className="animate-fade-in font-poppins text-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-space-grotesk font-black text-white">Top 10 <span className="text-cyan-400">AnalÃ­tico</span></h1>
          <p className="text-gray-400 text-sm mt-2 italic font-light">Ranking de alumnos con mayor impacto en tu academia.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">Filtrar por Curso:</label>
          
          {/* CUSTOM NEON DROPDOWN */}
          <div className="relative w-64" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#0d1524] border border-blue-500/20 rounded-xl px-4 py-2 text-xs font-bold text-gray-300 hover:border-cyan-500/50 transition-all flex items-center justify-between group"
            >
              <span className="truncate pr-2">{filterLabel}</span>
              <span className={`text-[10px] text-cyan-500/50 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`}>â–¼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full bg-[#0d1524] border border-blue-500/20 rounded-xl shadow-2xl shadow-black p-1 z-50 animate-fade-in overflow-hidden">
                <button 
                  onClick={() => handleFilterChange('')}
                  className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!selectedCourseId ? 'bg-blue-600/20 text-cyan-400' : 'text-gray-500 hover:bg-blue-600/10 hover:text-white'}`}
                >
                  TODOS MIS CURSOS
                </button>
                <div className="h-px bg-blue-500/10 my-1 mx-2" />
                {courses.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => handleFilterChange(c.id)}
                    className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedCourseId === c.id ? 'bg-blue-600/20 text-cyan-400' : 'text-gray-500 hover:bg-blue-600/10 hover:text-white'}`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[650px] overflow-y-auto pr-4 custom-scrollbar">
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="p-24 text-center bg-[#0d1524] rounded-[2.5rem] border border-blue-500/10 shadow-2xl">
               <div className="mb-6 opacity-20 text-6xl">ðŸ‘¥</div>
               <p className="text-gray-500 italic uppercase tracking-[0.3em] text-[10px] font-black leading-relaxed">
                  {selectedCourseId 
                    ? 'No hay alumnos inscritos en este curso todavÃ­a' 
                    : 'Sin alumnos destacados bajo estos parÃ¡metros'}
               </p>
               <div className="mt-8 flex justify-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500/30"></div>
                  <div className="w-1 h-1 rounded-full bg-blue-500/30"></div>
                  <div className="w-1 h-1 rounded-full bg-blue-500/30"></div>
               </div>
            </div>
          ) : filteredStudents.map((student: any, index: number) => {
             const isExpanded = expandedStudentId === student.user.id;
             const latestEnrolledDate = new Date(Math.max(...student.enrollments.map((e: any) => new Date(e.enrolledAt).getTime())));
             
             return (
               <div 
                 key={student.user.id} 
                 className={`bg-[#0d1524] border ${isExpanded ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/5' : 'border-blue-500/10'} rounded-3xl transition-all duration-300 overflow-hidden ring-1 ring-blue-500/5 group`}
               >
                 {/* ACCORDION TRIGGER */}
                 <div 
                   onClick={() => setExpandedStudentId(isExpanded ? null : student.user.id)}
                   className="p-6 cursor-pointer flex items-center justify-between group-hover:bg-blue-600/5 transition-colors"
                 >
                   <div className="flex items-center gap-6">
                      <div className="relative">
                         <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-black text-sm text-cyan-400 shadow-md">
                           {student.user.name[0]}{student.user.lastName[0]}
                         </div>
                         <span className="absolute -top-2 -left-2 w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center text-[10px] font-black text-black shadow-lg">#{index + 1}</span>
                      </div>
                      <div>
                         <p className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors uppercase text-sm tracking-tight">{student.user.name} {student.user.lastName}</p>
                         <div className="mt-1 flex items-center gap-3">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.1em]">{student.enrollmentCount} Inscripciones AcadÃ©micas</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span className="text-[9px] font-black text-cyan-500/70 uppercase">Activo</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                         <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1 italic">Ãšltima Actividad</p>
                         <p className="text-[10px] font-black text-gray-400 uppercase font-mono">
                           {latestEnrolledDate.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}
                         </p>
                      </div>
                      <div className={`w-8 h-8 rounded-xl border border-blue-500/20 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 border-cyan-500/50 text-cyan-400' : 'text-gray-600'}`}>
                         â–¼
                      </div>
                   </div>
                 </div>

                 {/* ACCORDION CONTENT */}
                 <div 
                   className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] border-t border-blue-500/10 opacity-100' : 'max-h-0 opacity-0'}`}
                 >
                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 italic">Desglose de Progreso por Curso</p>
                         <div className="space-y-3">
                           {student.enrollments.map((e: any) => {
                              const totalLessons = e.course._count.lessons;
                              const completedLessons = student.user.progressRecords?.filter((p: any) => p.courseId === e.courseId && p.completed).length || 0;
                              const progressPercentage = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;
                              
                              const quiz = student.user.quizAttempts?.find((qa: any) => qa.courseId === e.courseId);
                              const cert = student.user.certifications?.find((c: any) => c.courseId === e.courseId);

                              return (
                                 <div key={e.id} className="bg-white/3 border border-white/5 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group/card">
                                    <div className="flex justify-between items-start mb-4">
                                       <p className="text-[11px] font-black text-gray-300 group-hover/card:text-white uppercase tracking-tighter truncate max-w-[250px]">
                                          {e.course.title}
                                       </p>
                                       <div className="flex gap-2">
                                          {quiz && (
                                             <span className={`text-[9px] font-black px-2 py-0.5 rounded ${quiz.passed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                 {quiz.scorePercentage}% {quiz.passed ? 'OK' : 'FAIL'}
                                             </span>
                                          )}
                                          {cert && <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-black">ðŸ“œ CERT</span>}
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                          <div 
                                             className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000" 
                                             style={{ width: `${progressPercentage}%` }} 
                                          />
                                       </div>
                                       <span className="text-[10px] font-black text-gray-500 font-mono italic">{progressPercentage}%</span>
                                    </div>
                                 </div>
                              );
                           })}
                         </div>
                      </div>

                      <div className="bg-[#152035]/30 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center text-center">
                         <div className="mb-6">
                           <p className="text-4xl shadow-cyan-500/50 drop-shadow-lg mb-2">ðŸ†</p>
                           <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em] font-space-grotesk">AnÃ¡lisis de Alumno</p>
                         </div>
                         <div className="space-y-4">
                           <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <span className="text-[10px] font-bold text-gray-600 uppercase">Miembro desde</span>
                              <span className="text-xs font-black text-white">{formatGlobalDate(student.globalFirstEnrollment)}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <span className="text-[10px] font-bold text-gray-600 uppercase">InversiÃ³n en tu Academia</span>
                              <span className="text-xs font-black text-cyan-400 italic">MXN ${Number(student.totalInstructorInvestment).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 pt-4">
                              <span className="text-[10px] font-bold text-gray-600 uppercase">Estado AcadÃ©mico</span>
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Activo</span>
                           </div>
                         </div>
                      </div>
                   </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(59, 130, 246, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.2); border-radius: 10px; border: 1px solid rgba(59, 130, 246, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.4); }
      `}</style>
    </div>
  );
}

