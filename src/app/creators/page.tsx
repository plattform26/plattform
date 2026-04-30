'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatorsLandingPage() {
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

  useEffect(() => {
    checkSession();
  }, []);

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'INSTRUCTOR') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  return (
    <div className="min-h-screen bg-[#070d1a] text-white selection:bg-cyan-500/30">
      {/* NAV */}
      <nav className="flex items-center justify-between px-4 sm:px-10 h-16 bg-[#070d1a]/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex-shrink-0 min-w-fit flex items-center">
          <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-lg tracking-tighter flex-shrink-0 min-w-fit">
             <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent italic whitespace-nowrap">PLATTFORM</span>
             <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase font-black tracking-widest">Creators</span>
          </Link>
        </div>
        
        <div className="flex gap-4 items-center flex-shrink-0 min-w-fit">
          <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link href="/register/instructor" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-cyan-500/40 transition-all">Comenzar</Link>
        </div>
      </nav>

      {/* HERO FOR CREATORS */}
      <header className="relative py-32 px-4 sm:px-10 overflow-hidden">
        <div className="max-w-screen-xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Para Expertos y Profesores
          </div>
          <h1 className="font-space-grotesk text-5xl md:text-7xl font-black leading-[1.1] mb-8">
            Convierte tu maestría en un <br/>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-800 bg-clip-text text-transparent italic">activo digital.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            La infraestructura SaaS definitiva para crear, vender y automatizar tu academia online con inteligencia artificial. No somos un marketplace, somos tu marca.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register/instructor" className="px-10 py-4 rounded-full text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 hover:scale-105 transition-all">Abrir mi academia hoy</Link>
            <Link href="#planes" className="px-10 py-4 rounded-full text-base font-bold border border-blue-500/30 text-gray-300 hover:text-white hover:border-blue-500 transition-all">Ver Planes y Precios</Link>
          </div>
        </div>
        {/* Background Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
            <div className="absolute top-[10%] left-[20%] w-[40%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[50%] bg-cyan-500/10 blur-[100px] rounded-full"></div>
        </div>
      </header>

      {/* SaaS FEATURES */}
      <section className="py-24 px-4 sm:px-10 border-t border-blue-500/10 bg-[#0d1524]/30">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="text-4xl">🤖</div>
              <h3 className="text-xl font-bold font-space-grotesk">Copiloto IA</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Kit completo de IA: Generación de contenido, evaluaciones y carga inteligente de documentos para tus cursos.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl">💳</div>
              <h3 className="text-xl font-bold font-space-grotesk">Cobros Directos</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Integración nativa con Stripe. El dinero de tus ventas llega directamente a tu cuenta bancaria sin intermediarios.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl">🛡️</div>
              <h3 className="text-xl font-bold font-space-grotesk">Control Total</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Tú decides los precios, las promociones y quién tiene acceso. Es tu academia, bajo tu propio dominio y marca.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="planes" className="py-32 px-4 sm:px-10 relative overflow-hidden">
         <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-20">
             <h2 className="font-space-grotesk text-4xl md:text-5xl font-black mb-6">Planes <span className="text-cyan-400">Oficiales</span></h2>
             <p className="text-slate-400 max-w-xl mx-auto">Selecciona el plan que se adapte al tamaño de tu academia.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             {/* STARTER */}
             <div className="bg-[#0d1524] border border-blue-500/10 p-8 rounded-[32px] flex flex-col hover:border-blue-500/30 transition-all origin-bottom hover:-rotate-1">
                <h3 className="text-lg font-black uppercase tracking-widest text-gray-500 mb-2">Starter</h3>
                <p className="text-[10px] text-cyan-400/80 font-bold mb-4 uppercase tracking-widest italic">Tu propia academia bajo la red Plattform</p>
                <div className="text-4xl font-black mb-6">$199 <span className="text-xs font-normal text-gray-500">MXN/mes</span></div>
                <div className="space-y-4 mb-10 flex-1 text-sm text-gray-400">
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Hasta 20 alumnos</p>
                   <p className="flex items-center gap-3 opacity-30"> <span className="text-gray-600">✘</span> Sin funciones de IA</p>
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> 15% comisión por venta</p>
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Hosting de contenido incluido</p>
                </div>
                <Link href="/register/instructor" className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all text-center">Elegir Starter</Link>
             </div>
             {/* GROWTH */}
             <div className="bg-[#152035] border-2 border-cyan-500/50 p-8 rounded-[32px] flex flex-col relative transform scale-105 shadow-2xl shadow-cyan-500/10 z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest">CREADORES EN EXPANSIÓN</div>
                <h3 className="text-lg font-black uppercase tracking-widest text-cyan-400 mb-2">Growth</h3>
                <p className="text-[10px] text-white/60 font-medium mb-4 uppercase tracking-widest italic">Para creadores en expansión</p>
                <div className="text-4xl font-black mb-6">$299 <span className="text-xs font-normal text-gray-500">MXN/mes</span></div>
                <div className="space-y-4 mb-10 flex-1 text-sm text-gray-200">
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Hasta 100 alumnos</p>
                   <p className="flex items-center gap-3 opacity-30"> <span className="text-gray-600">✘</span> Sin funciones de IA</p>
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> 10% comisión por venta</p>
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Hosting de contenido incluido</p>
                </div>
                <Link href="/register/instructor" className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all text-center">Elegir Growth</Link>
             </div>
             {/* SCALE */}
             <div className="bg-[#0d1524] border border-blue-500/10 p-8 rounded-[32px] flex flex-col hover:border-blue-500/30 transition-all origin-bottom hover:rotate-1">
                <h3 className="text-lg font-black uppercase tracking-widest text-gray-500 mb-2">Scale</h3>
                <p className="text-[10px] text-cyan-400/80 font-bold mb-4 uppercase tracking-widest italic">La potencia total para tu academia</p>
                <div className="text-4xl font-black mb-6">$999 <span className="text-xs font-normal text-gray-500">MXN/mes</span></div>
                <div className="space-y-4 mb-10 flex-1 text-sm text-gray-400">
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Alumnos ilimitados</p>
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Kit completo de IA Powerhouse</p>
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Sólo 7% comisión por venta</p>
                   <p className="flex items-center gap-3"> <span className="text-cyan-500">✔</span> Infraestructura Elite PLATTFORM</p>
                </div>
                <Link href="/register/instructor" className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all text-center">Elegir Scale</Link>
             </div>
          </div>
         </div>
      </section>

      {/* CAPABILITIES SUMMARY (NEW) */}
      <section className="py-24 px-4 sm:px-10 bg-[#070d1a] border-t border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-[#0d1524] border border-blue-500/10 rounded-[3rem] p-12 shadow-3xl">
             <div className="text-center mb-12">
                <h3 className="text-2xl font-black font-space-grotesk uppercase tracking-tighter italic">Tus Capacidades por <span className="text-cyan-400">Plan</span></h3>
                <p className="text-gray-500 text-sm mt-2">Transparencia total en el crecimiento de tu academia.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* STARTER CAP */}
                <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-lg">🌱</span>
                      <span className="font-black uppercase tracking-widest text-xs text-gray-400">Starter</span>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-500">📚 Cursos</span>
                         <span className="text-white">Hasta 2</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-500">👥 Alumnos</span>
                         <span className="text-white">Hasta 20</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-500">🎯 Grupos</span>
                         <span className="text-white">1 Grupo</span>
                      </div>
                   </div>
                </div>

                {/* GROWTH CAP */}
                <div className="flex flex-col gap-6 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 shadow-xl shadow-cyan-500/5">
                   <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-lg">🚀</span>
                      <span className="font-black uppercase tracking-widest text-xs text-cyan-400">Growth</span>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-400">📚 Cursos</span>
                         <span className="text-white">Hasta 10</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-400">👥 Alumnos</span>
                         <span className="text-white">Hasta 100</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-400">🎯 Grupos</span>
                         <span className="text-white">Hasta 3</span>
                      </div>
                   </div>
                </div>

                {/* SCALE CAP */}
                <div className="flex flex-col gap-6 p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20">
                   <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">⚡</span>
                      <span className="font-black uppercase tracking-widest text-xs text-blue-400">Scale</span>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-400">📚 Cursos</span>
                         <span className="text-white">Ilimitados</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-400">👥 Alumnos</span>
                         <span className="text-white">Ilimitados</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-400">🎯 Grupos</span>
                         <span className="text-white">Ilimitados</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* DATA PROMISE */}
      <section className="py-24 px-4 sm:px-10 border-y border-white/5 bg-blue-600/5">
        <div className="max-w-screen-xl mx-auto text-center">
            <div className="text-3xl mb-6">🔒</div>
            <h3 className="font-space-grotesk text-3xl font-black mb-6 italic uppercase tracking-tighter">Resguardo y Privacidad</h3>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                Resguardo estricto y alta seguridad: Nos encargamos de la privacidad total de tu comunidad bajo estándares de protección de élite. Tu academia reside en un búnker digital seguro.
            </p>
        </div>
      </section>

      {/* FAQ FOR STRATEGIC BUYERS */}
      <section className="py-32 px-4 sm:px-10 bg-[#070d1a]">
        <div className="max-w-screen-md mx-auto">
          <h2 className="font-space-grotesk text-3xl font-black mb-12 text-center uppercase tracking-tighter italic">Línea de <span className="text-cyan-400">Soporte Estratégico</span></h2>
          <div className="space-y-4">
             {[
               { q: '¿Necesito saber programar para abrir mi academia?', a: 'En absoluto. Plattform está diseñada para que cualquier experto pueda configurar su portal en minutos sin una sola línea de código.'},
               { q: '¿Cómo se manejan los pagos de mis alumnos?', a: 'Utilizamos Stripe Connect. Cuando un alumno compra un curso, el dinero se procesa y se deposita directamente en tu cuenta bancaria vinculada.'},
               { q: '¿Qué tipo de soporte técnico ofrecen?', a: 'Contamos con un equipo dedicado que monitorea la infraestructura 24/7 y ofrece soporte por ticket y correo para resolver cualquier duda técnica.'},
               { q: '¿Mis datos están seguros?', a: 'Absolutamente. Nos encargamos del resguardo estricto de la información de tu comunidad bajo estándares de alta seguridad y encriptación de élite.'}
             ].map((faq, i) => (
               <div key={i} className="bg-[#152035] border border-blue-500/10 rounded-2xl p-6">
                  <h4 className="font-black text-gray-200 mb-3 text-sm uppercase tracking-wide">{faq.q}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-blue-500/10 bg-[#0d1524] py-12 px-6">
         <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="font-space-grotesk font-black text-2xl tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 whitespace-nowrap">PLATTFORM</div>
            
            <div className="flex items-center gap-4">
               <a 
                   href="https://wa.me/525623194635" 
                   target="_blank"
                   className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-all group"
               >
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#25D366]">WhatsApp</span>
                   <svg className="w-3.5 h-3.5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.554.921 3.141 1.407 4.811 1.408h.005c5.405 0 9.803-4.397 9.806-9.803.003-2.621-1.02-5.084-2.871-6.938-1.851-1.854-4.312-2.878-6.932-2.879h-.005c-5.405 0-9.803 4.398-9.806 9.806-.001 1.83.504 3.618 1.459 5.2l-.994 3.635 3.727-.977zm11.232-6.502c-.272-.136-1.61-.794-1.86-.885-.25-.091-.432-.136-.613.136-.182.273-.704.885-.863 1.067-.158.182-.317.204-.589.068-.272-.136-1.15-.424-2.19-1.354-.809-.722-1.355-1.614-1.514-1.886-.158-.272-.017-.42.119-.556.122-.122.272-.318.408-.477.136-.159.182-.272.272-.454l.068-.136c.091-.182.046-.341-.023-.477-.068-.136-.613-1.477-.84-2.022-.222-.534-.447-.461-.613-.471l-.523-.008c-.182 0-.477.068-.727.341-.25.273-.954.932-.954 2.272 0 1.341.977 2.636 1.114 2.818.136.182 1.921 2.934 4.659 4.114.651.28 1.158.448 1.554.573.654.208 1.25.179 1.721.108.524-.078 1.61-.659 1.837-1.295.227-.636.227-1.182.159-1.295-.069-.114-.249-.182-.522-.318z"/></svg>
               </a>
               <a 
                   href="mailto:soporte@plattform.mx" 
                   className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
               >
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-400">Email Status</span>
                   <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
               </a>
            </div>

            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">© 2026 Plattform Elite SaaS</div>
         </div>
      </footer>
    </div>
  );
}
