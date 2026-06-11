import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Recursos para Crear y Vender Cursos Online | Plattform',
  description: 'Guías y recursos para crear cursos online, vender conocimiento, lanzar una academia digital y entender cómo usar un LMS profesional.',
  alternates: {
    canonical: 'https://plattform.mx/recursos',
  },
};

export default function RecursosIndexPage() {
  const articles = [
    {
      title: 'Cómo vender cursos online en México',
      description: 'Aprende cómo vender cursos online en México, desde la estructura del curso hasta la elección de una plataforma para publicar, administrar alumnos y cobrar.',
      href: '/recursos/como-vender-cursos-online',
      emoji: '💰',
      date: '10 de junio, 2026',
    },
    {
      title: 'Qué es un LMS y para qué sirve',
      description: 'Conoce qué es un LMS, cómo funciona y por qué ayuda a academias, escuelas y creadores a administrar cursos, alumnos y contenidos online.',
      href: '/recursos/que-es-un-lms',
      emoji: '🎓',
      date: '8 de junio, 2026',
    },
    {
      title: 'Cómo crear una academia digital desde cero',
      description: 'Descubre los pasos para crear una academia digital: definir cursos, organizar contenidos, administrar alumnos y elegir una plataforma educativa profesional.',
      href: '/recursos/crear-academia-digital',
      emoji: '🚀',
      date: '5 de junio, 2026',
    },
    {
      title: 'Errores comunes al vender cursos online',
      description: 'Evita errores al vender cursos online: falta de estructura, mala experiencia del alumno, cobros manuales, contenido desordenado y poca claridad comercial.',
      href: '/recursos/errores-al-vender-cursos-online',
      emoji: '⚠️',
      date: '3 de junio, 2026',
    },
    {
      title: 'Plataforma de cursos online vs WhatsApp, Drive o Zoom',
      description: 'Compara las diferencias entre vender cursos por WhatsApp, Drive o Zoom y usar una plataforma profesional para administrar alumnos, contenidos y cursos online.',
      href: '/recursos/plataforma-cursos-online-vs-whatsapp-drive-zoom',
      emoji: '⚔️',
      date: '1 de junio, 2026',
    },
  ];

  const solutions = [
    { label: 'Plataforma de cursos online', href: '/plataforma-de-cursos-online' },
    { label: 'Vender cursos online', href: '/vender-cursos-online' },
    { label: 'LMS para academias', href: '/lms-para-academias' },
    { label: 'Plataforma para creadores', href: '/plataforma-para-creadores' },
    { label: 'Academia digital', href: '/academia-digital' },
  ];

  return (
    <div className="bg-[#070d1a] min-h-screen text-white font-poppins selection:bg-cyan-500/30 selection:text-white">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-blue-500/10">
        <Link href="/" className="font-space-grotesk font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          PLATTFORM
        </Link>
        <Link 
          href="/login" 
          className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* HERO / INTRO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl md:text-6xl font-space-grotesk font-black text-white leading-tight uppercase tracking-tight">
          Recursos para crear <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            y vender cursos online
          </span>
        </h1>
        
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed font-light">
          Aprende sobre metodologías educativas, plataformas LMS, estrategias de monetización y cómo estructurar tus conocimientos de forma profesional.
        </p>
      </section>

      {/* ARTICLES GRID */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, idx) => (
            <Link 
              key={idx} 
              href={article.href}
              className="group p-8 bg-[#0d1524] border border-blue-500/10 rounded-3xl hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-4xl block mb-6 group-hover:scale-110 transition-transform origin-left">
                  {article.emoji}
                </span>
                <h2 className="text-xl font-bold font-space-grotesk text-white group-hover:text-cyan-400 transition-colors mb-3">
                  {article.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed font-light mb-6">
                  {article.description}
                </p>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between border-t border-blue-500/5 pt-4">
                <span>{article.date}</span>
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Leer artículo →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-b from-[#070d1a] to-[#0d1524] border-t border-blue-500/10 py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-500/5 blur-3xl rounded-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-space-grotesk font-black text-white mb-6 uppercase tracking-tight">
            ¿Listo para digitalizar tu conocimiento?
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Crea tu academia digital en Plattform, gestiona a tus estudiantes y procesa cobros directos en pesos mexicanos con nuestro plan Starter de $199 MXN al mes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register?utm_source=seo&utm_medium=recursos&utm_campaign=index"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* INTERLINKING SECTION */}
      <section className="bg-[#070d1a] border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-space-grotesk font-bold uppercase tracking-widest text-cyan-400 mb-4 text-xs">
              Soluciones Plattform
            </h4>
            <ul className="space-y-2">
              {solutions.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                    {item.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-space-grotesk font-bold uppercase tracking-widest text-cyan-400 mb-4 text-xs">
              Recursos para crear cursos online
            </h4>
            <ul className="space-y-2">
              {articles.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                    {item.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-blue-500/10 bg-[#070d1a] py-8 text-center text-xs text-gray-600">
        <p>&copy; 2026 Plattform. La infraestructura moderna para la educación digital.</p>
      </footer>
    </div>
  );
}
