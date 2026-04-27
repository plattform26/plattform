'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAmount } from '@/lib/utils/currency';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userEnrollments, setUserEnrollments] = useState<string[]>([]);

  const fetchSessionData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setSession(data); // data ya tiene name, role, etc.
        
        // Si es alumno, buscar sus inscripciones para los botones
        if (data.role === 'STUDENT') {
           const enRes = await fetch('/api/student/courses');
           if (enRes.ok) {
              const enData = await enRes.json();
              setUserEnrollments(enData.map((e: any) => e.id));
           }
        }
      }
    } catch (e) { console.error('Session fetch error:', e); }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (query) qs.append('q', query);
      if (category) qs.append('category', category);
      
      const res = await fetch(`/api/courses?${qs.toString()}`);
      if (res.ok) {
         setCourses(await res.json());
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessionData();
    fetchCourses();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchCourses(); };

  const getDashboardLink = () => {
     if (!session) return '/login';
     if (session.role === 'ADMIN') return '/dashboard/admin';
     if (session.role === 'INSTRUCTOR') return '/dashboard/instructor';
     return '/dashboard/student';
  };

  const getDashboardLabel = () => {
     if (!session) return 'Mi Dashboard';
     if (session.role === 'ADMIN') return 'Panel Admin →';
     if (session.role === 'INSTRUCTOR') return 'Panel Instructor →';
     return 'Mi Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#070d1a] text-white font-poppins">
      <nav className="flex items-center justify-between px-4 sm:px-10 h-16 bg-[#0a1f44]/80 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
        <div className="flex items-center gap-8">
           <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-lg tracking-wider">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">PLATTFORM</span>
           </Link>
           
           {session && (
             <Link href={getDashboardLink()} className="text-[10px] font-bold text-slate-300 hover:text-cyan-400 transition-colors uppercase tracking-widest hidden md:block">
               ← Volver a mi Dashboard
             </Link>
           )}
        </div>
        
        <div className="flex items-center gap-4">
           {session ? (
             <div className="flex items-center gap-4">
                <div className="flex flex-col items-end hidden sm:flex">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.role}</span>
                   <span className="text-xs font-bold text-white">{session.name} {session.lastName}</span>
                </div>
                <Link href={getDashboardLink()} className="text-[11px] font-bold bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest">
                   {getDashboardLabel()}
                </Link>
             </div>
           ) : (
             <div className="flex items-center gap-3">
                <Link href="/login" className="text-[11px] font-bold border border-blue-500/30 px-4 py-2 rounded-lg text-cyan-400 hover:bg-blue-500/10 transition-all uppercase tracking-widest">Iniciar sesión</Link>
                <Link href="/register" className="text-[11px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg text-white transition-all uppercase tracking-widest">Registrarse</Link>
             </div>
           )}
        </div>
      </nav>
      
      <section className="py-16 px-4 sm:px-10 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-space-grotesk text-4xl font-extrabold mb-2 uppercase tracking-tighter">Explora nuestra <span className="text-cyan-400">academia</span></h1>
            <p className="text-slate-300 text-sm italic">Desarrolla tus habilidades con expertos de clase mundial.</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" placeholder="🔍 Buscar temas..." value={query} onChange={e => setQuery(e.target.value)}
              className="px-5 py-3 bg-[#152035] border border-blue-500/10 rounded-xl text-sm focus:outline-none focus:border-cyan-500 w-full md:w-80 transition-all"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] rounded-xl text-xs font-black shadow-lg shadow-blue-500/10 transition-all uppercase tracking-widest">Filtrar</button>
          </form>
        </div>

        <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
             <button onClick={() => setCategory('')}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black border transition-all whitespace-nowrap uppercase tracking-widest ${category === '' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-xl shadow-cyan-500/20' : 'bg-transparent border-blue-500/10 text-slate-300 hover:text-white hover:bg-blue-500/5'}`}
             >
               Todos los Cursos
             </button>
             {[
                { id: 'STRATEGY_BUSINESS', label: 'Estrategia y Negocios' },
                { id: 'TECH_INNOVATION', label: 'Tecnología e Innovación' },
                { id: 'DESIGN_MEDIA', label: 'Diseño y Media' },
                { id: 'DIGITAL_MARKETING', label: 'Marketing Digital' },
                { id: 'INVESTMENT_FINTECH', label: 'Inversión y Fintech' },
                { id: 'HIGH_PERFORMANCE', label: 'Alto Rendimiento' },
                { id: 'BIOHACKING_HEALTH', label: 'Biohacking y Salud' },
                { id: 'ACADEMIC_LEADERSHIP', label: 'Liderazgo Académico' }
             ].map(cat => (
               <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black border transition-all whitespace-nowrap uppercase tracking-widest ${category === cat.id ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-xl shadow-cyan-500/20' : 'bg-transparent border-blue-500/10 text-slate-300 hover:text-white hover:bg-blue-500/5'}`}
               >
                 {cat.label}
               </button>
            ))}
        </div>

        {loading ? (
          <div className="text-center py-32 space-y-4">
             <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Sincronizando catálogo...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-slate-300 bg-[#0d1524] rounded-3xl border border-blue-500/5 font-medium italic">No se encontraron resultados para tu búsqueda.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map(course => {
              const isEnrolled = userEnrollments.includes(course.id);
              return (
                <div key={course.id} className="group bg-[#0d1524] border border-blue-500/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_20px_50px_rgba(6,182,212,0.1)] transition-all flex flex-col relative">
                  <Link href={`/courses/${course.slug}`} className="cursor-pointer">
                    <div className="h-44 relative overflow-hidden">
                       {course.thumbnailUrl ? (
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                       ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#0a1f44] to-blue-900 flex items-center justify-center text-6xl">
                             <span className="group-hover:scale-110 transition-transform duration-500">🎓</span>
                          </div>
                       )}
                       <span className="absolute top-3 left-3 bg-cyan-600/20 text-cyan-400 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">{course.category}</span>
                       <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 italic">Por {course.instructorName}</div>
                     <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold text-slate-400 uppercase border border-white/5">
                           {course.level === 'BEGINNER' ? 'Principiante' : course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                        </span>
                     </div>
                     <Link href={`/courses/${course.slug}`}>
                        <h3 className="font-bold text-base leading-tight mb-4 flex-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{course.title}</h3>
                     </Link>

                      <div className="flex items-center justify-between mt-auto mb-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-yellow-400">★</span>
                          <span className="text-xs text-slate-300 font-bold">{course.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="font-black text-xl text-white tracking-tighter">${formatAmount(course.price)} <span className="text-[10px] text-slate-400">MXN</span></div>
                      </div>

                    {isEnrolled ? (
                       <Link 
                         href={`/dashboard/student/learn/${course.id}`} 
                         className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-xl text-[10px] font-black text-center transition-all uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20"
                       >
                         Ir al aula
                       </Link>
                    ) : (
                       <Link 
                         href={`/courses/${course.slug}`} 
                         className="w-full py-3 bg-[#152035] hover:bg-blue-600 text-gray-300 hover:text-white rounded-xl text-[10px] font-black text-center transition-all uppercase tracking-[0.2em] border border-blue-500/10 hover:border-blue-500/30"
                       >
                         Comprar ahora
                       </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
