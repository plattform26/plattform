import { notFound } from 'next/navigation';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import AcademyNavbar from '@/components/AcademyNavbar';
import { getSession } from '@/lib/auth';

export default async function InstructorProfile({ params }: { params: { slug: string } }) {
  let profile = null;
  const session = await getSession();

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/instructor/${params.slug}`, {
        cache: 'no-store'
    });

    if (!res.ok) {
        if (res.status === 404) return notFound();
        throw new Error('Fallback triggered');
    }

    profile = await res.json();
  } catch (error) {
    console.error('❌ Public Academy Render Error:', error);
    return (
        <div className="min-h-screen bg-[#070d1a] border border-red-500/10 rounded-3xl m-8 p-12 flex flex-col items-center justify-center text-center space-y-6">
            <span className="text-4xl opacity-50">📡</span>
            <h1 className="text-xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Error de Conexión</h1>
            <p className="text-gray-500 max-w-sm text-xs leading-relaxed">No pudimos enlazar con la base de datos de la academia en este momento. Por favor, intenta recargar la página en unos segundos.</p>
            <Link href="/" className="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase rounded-full hover:bg-white/10 transition-all">Volver al Inicio</Link>
        </div>
    );
  }

  const initials = profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'IP';
  const displayName = profile.academyName || profile.name;

  // Misión: Cortesía Pública para Academias en Fase No-Activa
  if (profile.status !== 'ACTIVE') {
    return (
        <div className="min-h-screen bg-[#070d1a] text-white font-poppins selection:bg-cyan-500/30 overflow-x-hidden p-8 flex items-center justify-center">
             <div className="max-w-xl w-full p-12 bg-[#0d1524]/60 backdrop-blur-xl border border-blue-500/20 rounded-[40px] text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000"></div>
                <div className="relative z-10 space-y-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">
                        🛡️
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-space-grotesk font-black italic uppercase tracking-tighter leading-tight italic">
                            Academia en <span className="text-cyan-400">Validación</span>
                        </h1>
                        <p className="text-gray-400 font-medium leading-relaxed italic">
                            Esta academia se encuentra actualmente en proceso de configuración y validación por nuestro equipo de calidad.
                        </p>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">Vuelve muy pronto para explorar el catálogo</p>
                        <Link href="/" className="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase rounded-full hover:bg-white/10 transition-all tracking-widest leading-none">Volver al Inicio</Link>
                    </div>
                </div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-1000"></div>
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1a] text-white font-poppins selection:bg-cyan-500/30 overflow-x-hidden">
      {/* GLOW DECORATIONS (Más sutiles) */}
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* INTELLIGENT NAVBAR */}
      <AcademyNavbar profile={profile} session={session} />

      {/* HERO SECTION - Slim & Boutique */}
      <section className="relative pt-16 pb-12 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
            {/* AVATAR BOX (Compacto) */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[35px] blur-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-[35px] bg-[#0d1524]/60 backdrop-blur-md border-[0.5px] border-white/10 p-1.5 overflow-hidden transform rotate-1 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                    {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-cover rounded-[28px]" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[28px] text-4xl font-black text-white shadow-inner">
                            {initials}
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white text-black px-3 py-1.5 rounded-xl font-black text-[8px] uppercase shadow-2xl tracking-tighter">
                    Instructor Verificado 🛡️
                </div>
            </div>

            <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-[0.3em]">
                    Academia Boutique
                </div>
                <h1 className="text-4xl md:text-5xl font-space-grotesk font-black tracking-tighter leading-tight italic uppercase">
                    {profile.name}
                </h1>
                
                {/* SPECIALTY & INSTITUTION */}
                <div className="flex flex-col items-center gap-1.5">
                    {profile.specialty && (
                        <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent italic">{profile.specialty}</p>
                    )}
                    {profile.institution && (
                        <div className="inline-flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/5 border border-white/5 px-4 py-2 rounded-full cursor-default hover:bg-white/10 transition-colors">
                            <span className="text-blue-500">🎓</span> {profile.institution}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4 py-4 border-b border-white/5 mb-4">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                        <StarRating value={profile.metrics?.globalRating || 0} readonly size="xs" />
                        <span className="text-[10px] font-bold text-yellow-500/80">{profile.metrics?.globalRating || 'N/A'}</span>
                    </div>
                    {profile.linkedinUrl && (
                        <a 
                            href={profile.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/5 border border-white/5 text-blue-500 text-[9px] font-black hover:bg-blue-500/10 transition-all uppercase tracking-widest"
                        >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0-1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/></svg>
                            LinkedIn
                        </a>
                    )}
                </div>
            </div>
        </div>
      </section>

      {/* MANIFESTO SECTION - Refined Proportion */}
      <section className="py-16 px-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[0.5px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="max-w-3xl mx-auto">
            <div className="relative p-10 md:p-14 rounded-[40px] bg-[#0d1524]/30 backdrop-blur-md border-[0.5px] border-white/5 overflow-hidden group">
                <div className="absolute top-2 left-4 text-7xl text-white/5 font-serif select-none pointer-events-none group-hover:text-white/10 transition-colors duration-1000">“</div>
                
                <div className="relative z-10 space-y-6">
                    <div className="text-center">
                        <span className="text-[9px] font-black tracking-[0.5em] text-cyan-500/60 uppercase mb-2 block">Filosofía Educativa</span>
                        <h2 className="text-xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Misión & Visión</h2>
                    </div>

                    <p className="text-xl md:text-2xl font-light text-gray-400 leading-relaxed md:leading-[1.6] text-center italic tracking-tight selection:bg-cyan-500/20">
                        {profile.description || 'Transformando el horizonte educativo a través de la excelencia y el compromiso incondicional con el éxito del estudiante.'}
                    </p>

                    <div className="flex justify-center pt-4">
                        <div className="w-8 h-[2px] bg-gradient-to-r from-blue-600/40 to-cyan-400/40 rounded-full"></div>
                    </div>
                </div>
            </div>
          </div>
      </section>

      {/* KEY METRICS - Compact */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0d1524]/40 backdrop-blur-sm border-[0.5px] border-white/5 p-6 rounded-[28px] text-center group hover:border-blue-500/20 transition-all">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Impacto</div>
                <div className="text-3xl font-space-grotesk font-black text-white mb-0.5 group-hover:text-blue-400 transition-colors">+{profile.metrics?.totalStudents || 0}</div>
                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">Alumnos Inscritos</div>
            </div>
            <div className="bg-[#0d1524]/40 backdrop-blur-sm border-[0.5px] border-white/5 p-6 rounded-[28px] text-center group hover:border-cyan-500/20 transition-all">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contenido</div>
                <div className="text-3xl font-space-grotesk font-black text-white mb-0.5 group-hover:text-cyan-400 transition-colors">{profile.metrics?.publishedCoursesCount || 0}</div>
                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">Cursos Activos</div>
            </div>
            <div className="bg-[#0d1524]/40 backdrop-blur-sm border-[0.5px] border-white/5 p-6 rounded-[28px] text-center group hover:border-blue-500/20 transition-all">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reputación</div>
                <div className="text-3xl font-space-grotesk font-black text-white mb-0.5 group-hover:text-yellow-500/80 transition-colors">{profile.metrics?.globalRating || '5.0'}</div>
                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">Valoración Media</div>
            </div>
        </div>
      </section>

      {/* COURSES CATALOG - Denser Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10 gap-6">
                <div>
                     <h2 className="text-3xl font-space-grotesk font-black italic uppercase italic">Colección <span className="text-cyan-400">Premium</span></h2>
                     <p className="text-gray-500 text-[10px] mt-1.5 uppercase tracking-widest font-black opacity-60">Programas de formación especializada</p>
                </div>
            </div>

            {(!profile.courses || profile.courses.length === 0) ? (
                <div className="py-20 text-center bg-[#0d1524]/20 border border-[0.5px] border-dashed border-white/10 rounded-[32px]">
                    <span className="text-3xl mb-3 block opacity-40">📚</span>
                    <p className="text-gray-500 text-[10px] italic font-light uppercase tracking-widest">Contenido en proceso de curación.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.courses.map((course: any) => (
                        <Link href={`/courses/${course.slug}`} key={course.id} className="group relative bg-[#0d1524]/40 backdrop-blur-md border-[0.5px] border-white/10 rounded-[28px] overflow-hidden hover:border-blue-500/40 transition-all flex flex-col hover:shadow-2xl hover:shadow-blue-500/5">
                            {/* THUMBNAIL (Más Compacto) */}
                            <div className="relative h-44 overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#0a1f44] to-black flex items-center justify-center text-3xl">🎓</div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-1.5">
                                    <span className="bg-black/60 backdrop-blur-md text-[8px] font-black text-white/80 px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/5">{course.category}</span>
                                </div>
                            </div>

                            {/* CONTENT (Compacto) */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-base font-bold leading-tight mb-3 group-hover:text-cyan-400 transition-colors uppercase tracking-tight line-clamp-2">{course.title}</h3>
                                
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center gap-1">
                                        <StarRating value={course.averageRating} readonly size="xs" />
                                        <span className="text-[10px] font-bold text-white/40">{course.averageRating.toFixed(1)}</span>
                                    </div>
                                    <div className="h-2.5 w-[0.5px] bg-white/10"></div>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest opacity-80">{course.studentCount} ESTUDIANTES</span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">INVERSIÓN</span>
                                        <span className="text-xl font-black text-white leading-none">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(course.price)}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm group-hover:bg-cyan-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                        →
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* CALL TO ACTION - Slim */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-[40px] bg-gradient-to-br from-blue-700/80 to-cyan-600/80 backdrop-blur-xl p-10 relative overflow-hidden text-center border-[0.5px] border-white/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="relative z-10 space-y-4">
                <h2 className="text-3xl md:text-4xl font-space-grotesk font-black tracking-tighter italic uppercase underline decoration-white/10 underline-offset-4">Transforma tu Carrera</h2>
                <p className="text-white/70 text-sm font-medium max-w-lg mx-auto italic leading-relaxed">Únete a la academia de {displayName} y comienza tu viaje hacia la maestría profesional hoy mismo.</p>
                <div className="pt-4">
                    <Link href="/courses" className="px-8 py-3.5 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-xl hover:shadow-white/10">Ver Catálogo</Link>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER (Slim & Elegant) */}
      <footer className="py-16 px-6 border-t border-white/5 bg-[#070d1a]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-3 text-center md:text-left">
                 <div className="font-space-grotesk font-black text-2xl tracking-tighter bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent italic uppercase">
                   {profile.academyName || 'PLATTFORM'}
                 </div>
                 <p className="text-gray-600 text-[10px] leading-relaxed max-w-xs uppercase font-black tracking-widest opacity-50">
                   {profile.specialty || 'Infraestructura educativa de alto impacto'}
                 </p>
            </div>
            <div className="flex gap-12">
                <div className="flex flex-col gap-2.5 items-center md:items-start text-[10px]">
                    <span className="font-black text-gray-700 uppercase tracking-[0.3em]">Explorar</span>
                    <Link href="/courses" className="font-bold text-gray-500 hover:text-white transition-colors">Cursos</Link>
                    <Link href="/" className="font-bold text-gray-500 hover:text-white transition-colors">Inicio</Link>
                </div>
                <div className="flex flex-col gap-2.5 items-center md:items-start text-[10px]">
                    <span className="font-black text-gray-700 uppercase tracking-[0.3em]">Conexión</span>
                    <Link href="/login" className="font-bold text-gray-500 hover:text-white transition-colors">Login</Link>
                    <Link href="/register" className="font-bold text-gray-500 hover:text-white transition-colors">Registro</Link>
                </div>
            </div>
        </div>
        <div className="max-w-5xl mx-auto pt-16 text-center">
            <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">© 2026 {displayName} · Plattform Boutique</p>
        </div>
      </footer>
    </div>
  );
}
