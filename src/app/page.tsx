'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StarRating from '@/components/StarRating';

export default function LandingPage() {
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

  // Optional: add debounce for query, or just fetch on Enter/button click
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'INSTRUCTOR') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Mi Dashboard';
    if (user.role === 'ADMIN') return 'Panel Admin →';
    if (user.role === 'INSTRUCTOR') return 'Panel Instructor →';
    return 'Mi Dashboard →';
  };

  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-4 sm:px-10 h-16 bg-[#0a1f44] border-b border-blue-500/20 sticky top-0 z-50">
        <Link href={user ? (user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'INSTRUCTOR' ? '/dashboard/instructor' : '/dashboard/student') : "/"} className="flex items-center gap-2 font-space-grotesk font-bold text-base sm:text-lg tracking-wider">
           <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">PLATTFORM</span>
        </Link>
        <div className="flex gap-2 sm:gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">{user.role}</span>
                <span className="text-xs font-semibold text-white">Hola, {user.name}</span>
              </div>
              <Link href={getDashboardUrl()} className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all">{getDashboardLabel()}</Link>
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 rounded-lg text-sm font-semibold border border-blue-500/30 text-gray-300 hover:text-white hover:border-blue-500 transition-all">Iniciar sesión</Link>
              <Link href="/register" className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_2px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.45)] transition-all">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="relative py-24 px-4 sm:px-10 flex items-center overflow-hidden min-h-[540px]">
        <div className="max-w-screen-xl mx-auto w-full flex items-center relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(59,130,246,0.18)_0%,transparent_70%),radial-gradient(ellipse_50%_50%_at_20%_80%,rgba(6,182,212,0.12)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              IA integrada para crear cursos
            </div>
            <h1 className="font-space-grotesk text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              Tu academia,<br/>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-800 bg-clip-text text-transparent italic">sin fricción.</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 font-light max-w-lg leading-relaxed">
              Infraestructura SaaS para que profesores expertos creen, vendan y escalen su conocimiento. De idea a curso en minutos.
            </p>
            <div className="flex gap-4">
              <Link href="/register" className="px-8 py-3 rounded-xl text-[15px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-transform">Crear mi academia →</Link>
              <a href="#catalogo" className="px-8 py-3 rounded-xl text-[15px] font-bold border border-blue-500/30 text-gray-300 hover:text-white hover:border-blue-500 transition-colors">Explorar cursos</a>
            </div>
          </div>
        </div>
      </header>

      {/* CATALOG */}
      <section id="catalogo" className="py-16 px-4 sm:px-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="font-space-grotesk text-3xl font-bold">Cursos <span className="text-cyan-400">disponibles</span></h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text" 
                placeholder="🔍 Buscar cursos..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="px-4 py-2 bg-[#152035] border border-blue-500/20 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full md:w-64"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors">Buscar</button>
            </form>
          </div>
  
          <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide">
             <button 
                onClick={() => setCategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${category === '' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)]' : 'bg-transparent border-blue-500/20 text-slate-300 hover:bg-blue-500/10'}`}
             >
               Todos
             </button>
             {[
                { id: 'BUSINESS_ENTREPRENEURSHIP', label: 'Negocios y Emprendimiento' },
                { id: 'TECH_INNOVATION', label: 'Tecnología e Innovación' },
                { id: 'DESIGN_CREATIVITY', label: 'Diseño y Creatividad' },
                { id: 'MARKETING_SALES', label: 'Marketing y Ventas' },
                { id: 'FINANCE_ECONOMY', label: 'Finanzas y Economía' },
                { id: 'PERSONAL_DEVELOPMENT', label: 'Desarrollo Personal' },
                { id: 'WELLBEING_LIFESTYLE', label: 'Bienestar y Estilo de Vida' },
                { id: 'EDUCATION_PEDAGOGY', label: 'Educación y Pedagogía' }
             ].map(cat => (
               <button 
                  key={cat.id} 
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${category === cat.id ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)]' : 'bg-transparent border-blue-500/20 text-slate-300 hover:bg-blue-500/10'}`}
               >
                 {cat.label}
               </button>
            ))}
          </div>

        {loading ? (
          <div className="text-center py-20 text-blue-400">Cargando catálogo...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-slate-300 bg-[#152035] rounded-xl border border-blue-500/10">No se encontraron cursos con estos filtros.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <Link href={`/courses/${course.slug}`} key={course.id} className="group bg-[#152035] border border-blue-500/20 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all flex flex-col">
                <div className="h-40 bg-gradient-to-br from-blue-900 to-[#0a1f44] flex items-center justify-center text-5xl relative">
                  📚
                  <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">{course.category}</span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs text-cyan-400 font-medium mb-1">{course.instructorName}</div>
                  <h3 className="font-semibold text-[15px] leading-snug mb-2 flex-1 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-400 mb-3">
                    <span>⏱ {course.durationHours}h</span>
                    <span>🎓 {course.studentCount}</span>
                  </div>
                    <div className="flex items-center justify-between mt-auto">
                      <StarRating value={course.averageRating} readonly size="sm" />
                      <div className="font-bold text-lg text-cyan-400">${course.price} <span className="text-[10px] text-gray-400">MXN</span></div>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-10 bg-[#070d1a]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="font-space-grotesk text-4xl font-bold mb-4">¿Por qué <span className="text-cyan-400">Plattform</span>?</h2>
             <p className="text-slate-300 max-w-2xl mx-auto">La única plataforma que incluye herramientas de inteligencia artificial y cobro automático en un solo lugar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors">
               <div className="text-3xl mb-4">🤖</div>
               <h3 className="font-bold text-lg mb-2">IA que trabaja por ti</h3>
               <p className="text-slate-300 text-sm">Genera módulos, lecciones y evaluaciones en segundos</p>
            </div>
            <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors">
               <div className="text-3xl mb-4">💰</div>
               <h3 className="font-bold text-lg mb-2">Monetización directa</h3>
               <p className="text-slate-300 text-sm">El dinero llega directo a tu cuenta vía Stripe</p>
            </div>
            <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors">
               <div className="text-3xl mb-4">🎓</div>
               <h3 className="font-bold text-lg mb-2">Certificados automáticos</h3>
               <p className="text-slate-300 text-sm">Al completar y aprobar, el alumno recibe su certificado</p>
            </div>
            <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors">
               <div className="text-3xl mb-4">📊</div>
               <h3 className="font-bold text-lg mb-2">Dashboard de negocio</h3>
               <p className="text-slate-300 text-sm">Visualiza ingresos y monitorea alumnos</p>
            </div>
            <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors">
               <div className="text-3xl mb-4">⚡</div>
               <h3 className="font-bold text-lg mb-2">Sin fricción técnica</h3>
               <p className="text-slate-300 text-sm">Tu academia lista en minutos sin programar</p>
            </div>
            <div className="bg-[#152035] border border-blue-500/20 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors">
               <div className="text-3xl mb-4">🔒</div>
               <h3 className="font-bold text-lg mb-2">Pagos seguros con Stripe</h3>
               <p className="text-slate-300 text-sm">Infraestructura de cobro integrada</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="py-20 px-4 sm:px-10 bg-[#070d1a] relative">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_100%)]"></div>
         <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-16">
             <h2 className="font-space-grotesk text-4xl font-bold mb-4">Planes para <span className="text-cyan-400">instructores</span></h2>
             <p className="text-slate-300 max-w-2xl mx-auto">Selecciona el plan que se adapte al tamaño de tu academia.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             <div className="bg-[#152035] border border-blue-500/20 p-8 rounded-3xl flex flex-col">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-4xl font-extrabold mb-4">$199 <span className="text-sm font-normal text-gray-400">MXN/mes</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                   <li className="flex gap-2"><span>✓</span> 20 alumnos</li>
                   <li className="flex gap-2"><span>✗</span> Sin IA</li>
                   <li className="flex gap-2"><span>✓</span> 15% comisión por venta</li>
                </ul>
                <Link href="/register/instructor" className="w-full block text-center py-3 rounded-xl border border-blue-500/30 hover:bg-blue-500/10 font-bold transition-colors">Comenzar Starter</Link>
             </div>
             <div className="bg-gradient-to-b from-[#1a2f55] to-[#0d172a] border border-cyan-500/50 p-8 rounded-3xl flex flex-col relative transform scale-105 shadow-[0_0_30px_rgba(6,182,212,0.15)] z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</div>
                <h3 className="text-xl font-bold mb-2">Growth</h3>
                <div className="text-4xl font-extrabold mb-4 text-cyan-400">$299 <span className="text-sm font-normal text-gray-400">MXN/mes</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-200">
                   <li className="flex gap-2"><span>✓</span> 100 alumnos</li>
                   <li className="flex gap-2"><span>✗</span> Sin IA</li>
                   <li className="flex gap-2"><span>✓</span> 10% comisión por venta</li>
                </ul>
                <Link href="/register/instructor" className="w-full block text-center py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors">Comenzar Growth</Link>
             </div>
             <div className="bg-[#152035] border border-blue-500/20 p-8 rounded-3xl flex flex-col">
                <h3 className="text-xl font-bold mb-2">Scale</h3>
                <div className="text-4xl font-extrabold mb-4">$999 <span className="text-sm font-normal text-gray-400">MXN/mes</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                   <li className="flex gap-2"><span>✓</span> Alumnos ilimitados</li>
                   <li className="flex gap-2"><span>✓</span> Full IA + Carga de Documentos</li>
                   <li className="flex gap-2"><span>✓</span> 7% comisión por venta</li>
                </ul>
                <Link href="/register/instructor" className="w-full block text-center py-3 rounded-xl border border-blue-500/30 hover:bg-blue-500/10 font-bold transition-colors">Comenzar Scale</Link>
             </div>
          </div>
         </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-10 bg-[#070d1a]">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-space-grotesk text-3xl font-bold mb-10 text-center">Preguntas <span className="text-cyan-400">frecuentes</span></h2>
          <div className="space-y-4">
             {[
               { q: '¿Cuánto cuesta publicar mi curso?', a: 'Pagas renta mensual según plan más comisión por venta. Tus alumnos no pagan cuota a Plattform.'},
               { q: '¿Cómo recibo mis ingresos?', a: 'Vía Stripe directo a tu cuenta bancaria. No manejamos monedero virtual.'},
               { q: '¿Necesito saber programar?', a: 'No. Usa el generador de IA o el builder manual.'},
               { q: '¿Puedo subir videos?', a: 'Via enlaces de YouTube o Vimeo. El contenido escrito vive en Plattform.'},
               { q: '¿Qué pasa si cancelo mi suscripción?', a: 'Tus cursos se hibernan pero tus alumnos mantienen su acceso.'},
               { q: '¿Los certificados tienen validez oficial?', a: 'Son constancias de formación continua con código de verificación único.'}
             ].map((faq, i) => (
               <div key={i} className="bg-[#152035] border border-blue-500/20 rounded-xl p-5">
                  <h4 className="font-bold text-gray-200 mb-2">{faq.q}</h4>
                  <p className="text-slate-300 text-sm">{faq.a}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* FOOTER MULTICOLUMNA */}
      <footer className="border-t border-blue-500/20 bg-[#0a1f44] pt-16 pb-8 px-4 sm:px-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
             <div>
                <div className="font-space-grotesk text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent inline-block">PLATTFORM</div>
                <p className="text-slate-300 text-sm mb-6 max-w-xs">La infraestructura SaaS para que profesores universitarios creen, vendan y escalen su conocimiento en línea.</p>
                <Link href="/register/instructor" className="inline-block px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors">Crear mi academia →</Link>
             </div>
           <div>
              <h4 className="font-bold mb-4 text-gray-200">Plataforma</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                 <li><Link href="#catalogo" className="hover:text-cyan-400 transition">Explorar cursos</Link></li>
                 <li><Link href="#" className="hover:text-cyan-400 transition">Planes y precios</Link></li>
                 <li><Link href="/register/instructor" className="hover:text-cyan-400 transition">Para instructores</Link></li>
                 <li><Link href="/register" className="hover:text-cyan-400 transition">Registrarse</Link></li>
              </ul>
           </div>
           <div>
              <h4 className="font-bold mb-4 text-gray-200">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                 <li><a href="#" className="hover:text-cyan-400 transition">Quiénes somos</a></li>
                 <li><a href="#" className="hover:text-cyan-400 transition">FAQ</a></li>
                 <li><a href="#" className="hover:text-cyan-400 transition">Contacto</a></li>
                 <li><a href="#" className="hover:text-cyan-400 transition">Política de privacidad</a></li>
                 <li><a href="#" className="hover:text-cyan-400 transition">Términos de uso</a></li>
              </ul>
           </div>
           <div>
              <h4 className="font-bold mb-4 text-gray-200">Planes</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                  <li><span className="text-gray-300">Starter</span> $199/mes</li>
                  <li><span className="text-gray-300">Growth</span> $299/mes</li>
                  <li><span className="text-gray-300">Scale</span> $999/mes</li>
              </ul>
           </div>
          </div>
          <div className="text-center text-gray-500 text-sm pt-8 border-t border-blue-500/20">
             © 2025 Plattform. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
