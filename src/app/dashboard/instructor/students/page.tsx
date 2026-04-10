'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function StudentsPageContent() {
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
        
        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(Array.isArray(cData) ? cData : []);
        }
        
        if (eRes.ok) {
          const eData = await eRes.json();
          setGroupedStudents(Array.isArray(eData) ? eData : []);
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
          <h1 className="text-3xl font-space-grotesk font-black text-white">Top 10 <span className="text-cyan-400">Analítico</span></h1>
          <p className="text-gray-400 text-sm mt-2 italic font-light">Ranking de alumnos con mayor impacto en tu academia.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">Filtrar por Curso:</label>
          <div className="relative w-64" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#0d1524] border border-blue-500/20 rounded-xl px-4 py-2 text-xs font-bold text-gray-300 hover:border-cyan-500/50 transition-all flex items-center justify-between group"
            >
              <span className="truncate pr-2">{filterLabel}</span>
              <span className={`text-[10px] text-cyan-500/50 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`}>▼</span>
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
               <div className="mb-6 opacity-20 text-6xl">👥</div>
               <p className="text-gray-500 italic uppercase tracking-[0.3em] text-[10px] font-black leading-relaxed">
                  {selectedCourseId 
                    ? 'No hay alumnos inscritos en este curso todavía' 
                    : 'Sin alumnos destacados bajo estos parámetros'}
               </p>
            </div>
          ) : filteredStudents.map((student: any, index: number) => {
              const isExpanded = expandedStudentId === student.user.id;
              const latestEnrolledDate = new Date(Math.max(...student.enrollments.map((e: any) => new Date(e.enrolledAt).getTime())));
              return (
                <div key={student.user.id} className={`bg-[#0d1524] border ${isExpanded ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/5' : 'border-blue-500/10'} rounded-3xl transition-all duration-300 overflow-hidden ring-1 ring-blue-500/5 group`}>
                  <div onClick={() => setExpandedStudentId(isExpanded ? null : student.user.id)} className="p-6 cursor-pointer flex items-center justify-between group-hover:bg-blue-600/5 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-black text-sm text-cyan-400">
                          {student.user.name[0]}{student.user.lastName[0]}
                        </div>
                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center text-[10px] font-black text-black">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors uppercase text-sm">{student.user.name} {student.user.lastName}</p>
                        <div className="mt-1 flex items-center gap-3">
                           <span className="text-[9px] font-black text-gray-600 uppercase">{student.enrollmentCount} Inscripciones</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl border border-blue-500/20 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 border-cyan-500/50 text-cyan-400' : 'text-gray-600'}`}>▼</div>
                  </div>
                  {isExpanded && (
                    <div className="p-8 border-t border-blue-500/10 grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase italic">Desglose de Progreso</p>
                        {student.enrollments.map((e: any) => (
                          <div key={e.id} className="bg-white/3 border border-white/5 rounded-2xl p-5">
                            <p className="text-[11px] font-black text-gray-300 uppercase mb-2">{e.course.title}</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: '50%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
          })}
        </div>
      </div>
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(59, 130, 246, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-500 uppercase tracking-widest text-xs">Cargando Interfaz...</div>}>
      <StudentsPageContent />
    </Suspense>
  );
}