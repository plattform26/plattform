'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StarRating from '@/components/StarRating';

export default function EliteStudentLanding() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (query) qs.append('q', query);
      if (category) qs.append('category', category);
      
      const res = await fetch(`/api/courses?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    checkSession();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const getDashboardRoute = (role?: string) => {
    switch (role) {
      case 'ADMIN': return '/dashboard/admin';
      case 'INSTRUCTOR': return '/dashboard/instructor';
      case 'STUDENT': return '/dashboard/student';
      default: return '/';
    }
  };

  const dashboardHref = user ? getDashboardRoute(user.role) : '/';

  const masterAreas = [
    { id: 'STRATEGY_BUSINESS', label: 'Estrategia & Negocios', icon: '💼' },
    { id: 'TECH_INNOVATION', label: 'Tech & Innovación', icon: '🚀' },
    { id: 'DESIGN_MEDIA', label: 'Diseño & Media', icon: '🎨' },
    { id: 'DIGITAL_MARKETING', label: 'Marketing Digital', icon: '📈' },
    { id: 'INVESTMENT_FINTECH', label: 'Inversión & Fintech', icon: '💰' },
    { id: 'HIGH_PERFORMANCE', label: 'Alto Rendimiento', icon: '🧠' },
    { id: 'BIOHACKING_HEALTH', label: 'Biohacking & Salud', icon: '🌿' },
    { id: 'ACADEMIC_LEADERSHIP', label: 'Liderazgo Académico', icon: '🏛️' }
  ];

  return (
    <div className="min-h-screen bg-[#070d1a] text-white selection:bg-cyan-500/30 font-poppins selection:text-white">
      
      {/* HEADER ELITE */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-[#070d1a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sm:px-12 z-[100]">
        <div className="flex-shrink-0 min-w-fit flex items-center">
          <Link href={user ? dashboardHref : "/"} className="flex items-center gap-2 group transition-all flex-shrink-0 min-w-fit">
            <span className="font-space-grotesk font-black text-2xl tracking-tighter italic bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform whitespace-nowrap">PLATTFORM</span>
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center px-8">
          <div className="flex items-center gap-10">
            <Link href="#categorias" className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 hover:text-cyan-400 transition-colors">Explorar</Link>
            <Link href="#experiencia" className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 hover:text-cyan-400 transition-colors">Experiencia</Link>
            <Link href="/creators" className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 hover:text-blue-400 transition-colors bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/10 whitespace-nowrap">Para Creadores</Link>
          </div>
        </div>

        <div className="flex-shrink-0 min-w-fit flex items-center gap-6">
          {user ? (
            <Link href={dashboardHref} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:shadow-cyan-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0">Dashboard →</Link>
          ) : (
            <>
              <Link href="/login" className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-cyan-500/40 transition-all">Comenzar</Link>
            </>
          )}
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-[90vh] flex flex-col items-center">
            {/* Mesh Gradient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            </div>

            <div className="max-w-4xl w-full text-center relative z-10">
                <div className="inline-block bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-10 animate-fade-in text-center mx-auto">Plataforma de Élite</div>
                <h1 className="font-space-grotesk text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter mb-12 animate-slide-up text-center">
                    DOMINA LAS HABILIDADES <br/>
                    <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent italic">DEL FUTURO.</span>
                </h1>
                
                {/* HERO SEARCH */}
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-[#0d1524] rounded-2xl flex items-center p-2 border border-white/10">
                        <input 
                            type="text" 
                            placeholder="¿Qué quieres aprender hoy?" 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 px-6 py-4 font-medium"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-xl hover:scale-105 active:scale-95 transition-all text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </div>
                </form>
            </div>
        </section>

        {/* CATEGORIES GRID */}
        <section id="categorias" className="py-24 px-6 md:px-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="max-w-lg">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] mb-4">Catálogo de Cursos</h2>
                        <h3 className="font-space-grotesk text-4xl font-bold leading-tight">Explora las 8 Áreas de <span className="italic">Transformación Digital.</span></h3>
                    </div>
                    <button 
                        onClick={() => setCategory('')}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors pb-1 border-b border-white/10"
                    >
                        Ver todo el catálogo
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {masterAreas.map((area) => (
                        <button 
                            key={area.id}
                            onClick={() => {
                                setCategory(area.id);
                                document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`group relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden text-left ${category === area.id ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.08] hover:-translate-y-2'}`}
                        >
                            <div className="text-3xl mb-6 group-hover:scale-125 transition-transform duration-500">{area.icon}</div>
                            <h4 className={`text-[11px] font-black uppercase tracking-widest leading-tight ${category === area.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{area.label}</h4>
                            
                            {/* Glow Effect */}
                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    ))}
                </div>
            </div>
        </section>

        {/* COURSE CATALOG */}
        <section id="explorar" className="py-24 px-6 md:px-24 bg-[#0a1528]/30">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                   {category && (
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-4">
                        <span>Filtrando por: {masterAreas.find(a => a.id === category)?.label}</span>
                        <button onClick={() => setCategory('')} className="bg-white/10 p-1 rounded-full hover:bg-white/20 transition-colors">×</button>
                    </div>
                   )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-80 bg-white/5 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">No se han encontrado cursos activos en esta área.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {courses.map(course => (
                            <Link 
                                href={`/courses/${course.slug}`} 
                                key={course.id}
                                className="group relative bg-[#0d1524] border border-white/5 rounded-[32px] overflow-hidden hover:border-blue-500/40 transition-all duration-300 shadow-2xl hover:shadow-blue-500/10"
                            >
                                <article>
                                    {/* Thumbnail Glow */}
                                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                                    
                                    <div className="relative h-48 bg-[#152035] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-700">
                                        {masterAreas.find(a => a.id === course.category)?.icon || '📚'}
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-cyan-400 border border-white/10">Curso</div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[8px]">⭐</div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Instructor: {course.instructorName}</span>
                                        </div>
                                        <h3 className="font-space-grotesk text-xl font-bold mb-4 leading-tight group-hover:text-cyan-400 transition-colors">{course.title}</h3>
                                        
                                        <div className="flex items-center justify-between mt-8 border-t border-white/5 pt-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Inversión</span>
                                                <span className="text-xl font-black text-white">${course.price} <span className="text-[10px] text-gray-400 ml-1">MXN</span></span>
                                            </div>
                                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all duration-500">
                                                <span className="text-lg group-hover:scale-125 transition-transform leading-none text-white">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experiencia" className="py-32 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-10 text-center w-full">Metodología Plattform</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div className="bg-white/5 p-10 rounded-[40px] border border-white/5">
                        <div className="text-3xl mb-6">💎</div>
                        <h4 className="font-bold text-xl mb-4">Experiencia Real</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Solo expertos con destacada experiencia laboral y capacidad docente publican en Plattform. Cada minuto es una inversión de alto retorno para tu carrera.</p>
                    </div>
                    <div className="bg-white/5 p-10 rounded-[40px] border border-white/5">
                        <div className="text-3xl mb-6">🏛️</div>
                        <h4 className="font-bold text-xl mb-4">Certificación Pro</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Nuestros certificados son credenciales digitales que respaldan tus nuevas habilidades ante cualquier institución.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#070d1a] border-t border-white/5 pt-24 pb-12 px-6 sm:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                <div className="md:col-span-2">
                    <div className="font-space-grotesk font-black text-4xl tracking-tighter italic text-white mb-8">PLATTFORM</div>
                    <p className="text-gray-500 text-base max-w-sm leading-relaxed">La infraestructura definitiva para el aprendizaje de alto rendimiento. De expertos para profesionales.</p>
                </div>
                <div>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8">Comunidad</h5>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li><Link href="/creators" className="hover:text-cyan-400 transition-colors">Para Instructores</Link></li>
                        <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8">Legal</h5>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacidad</Link></li>
                        <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Términos</Link></li>
                        <li><Link href="/refunds" className="hover:text-cyan-400 transition-colors">Reembolsos</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-12 gap-8">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-700">© 2026 PLATTFORM · THE ELITE LEARNING EXPERIENCE</div>
                
                {/* MULTI-CHANNEL SUPPORT */}
                <div className="flex items-center gap-4">
                    <a 
                        href="https://wa.me/525623194635" 
                        target="_blank"
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-all group"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#25D366]">WhatsApp</span>
                        <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.554.921 3.141 1.407 4.811 1.408h.005c5.405 0 9.803-4.397 9.806-9.803.003-2.621-1.02-5.084-2.871-6.938-1.851-1.854-4.312-2.878-6.932-2.879h-.005c-5.405 0-9.803 4.398-9.806 9.806-.001 1.83.504 3.618 1.459 5.2l-.994 3.635 3.727-.977zm11.232-6.502c-.272-.136-1.61-.794-1.86-.885-.25-.091-.432-.136-.613.136-.182.273-.704.885-.863 1.067-.158.182-.317.204-.589.068-.272-.136-1.15-.424-2.19-1.354-.809-.722-1.355-1.614-1.514-1.886-.158-.272-.017-.42.119-.556.122-.122.272-.318.408-.477.136-.159.182-.272.272-.454l.068-.136c.091-.182.046-.341-.023-.477-.068-.136-.613-1.477-.84-2.022-.222-.534-.447-.461-.613-.471l-.523-.008c-.182 0-.477.068-.727.341-.25.273-.954.932-.954 2.272 0 1.341.977 2.636 1.114 2.818.136.182 1.921 2.934 4.659 4.114.651.28 1.158.448 1.554.573.654.208 1.25.179 1.721.108.524-.078 1.61-.659 1.837-1.295.227-.636.227-1.182.159-1.295-.069-.114-.249-.182-.522-.318z"/></svg>
                    </a>
                    <a 
                        href="mailto:soporte@platform.mx" 
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-400">Email Support</span>
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </a>
                </div>
            </div>
        </div>
      </footer>

      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style jsx global>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slide-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.2, 1, 0.3, 1) forwards; }
        .animate-pulse-slow { animation: pulse 8s infinite; }
        @keyframes pulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.2; }
        }
        .font-space-grotesk { font-family: var(--font-space-grotesk); }
      `}</style>
    </div>
  );
}
