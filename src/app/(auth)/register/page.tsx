import Link from 'next/link';

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center justify-center bg-[#070d1a] text-white">
      {/* LOGO / HEADER */}
      <div className="mb-10 animate-fade-in">
        <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-3xl tracking-tighter">
           <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 bg-clip-text text-transparent">PLATTFORM</span>
        </Link>
      </div>

      <div className="max-w-4xl w-full p-2 mt-4 mb-12">
        <div className="text-center mb-16">
           <h2 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4">Únete a <span className="text-cyan-400">Plattform</span></h2>
           <p className="text-gray-400 text-lg font-light">¿Cómo deseas participar en nuestra comunidad?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* ALUMNO */}
           <Link href="/register/student" className="group bg-[#0d1524] border border-blue-500/10 p-10 rounded-3xl hover:border-blue-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">🎓</div>
              <h3 className="text-2xl font-bold mb-3">Registrarme como alumno</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">Aprende de los mejores expertos, cursa a tu propio ritmo y obtén certificados con validez.</p>
              <div className="mt-auto px-6 py-4 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/10 font-bold transition-all w-full text-sm uppercase tracking-widest">Soy estudiante →</div>
           </Link>

           {/* INSTRUCTOR */}
           <Link href="/register/instructor" className="group bg-gradient-to-b from-[#1a2f55] to-[#0d172a] border border-cyan-500/20 p-10 rounded-3xl hover:border-cyan-400/50 hover:shadow-[0_20px_60px_rgba(6,182,212,0.15)] transition-all flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
              <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">🚀</div>
              <h3 className="text-2xl font-bold mb-3 text-cyan-400">Crear mi academia</h3>
              <p className="text-gray-300 mb-8 leading-relaxed">Monetiza tu conocimiento, usa herramientas de IA y escala tu negocio online con nuestra infraestructura SaaS.</p>
              <div className="mt-auto px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold group-hover:from-cyan-400 group-hover:to-blue-500 transition-all w-full text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/20">Soy instructor →</div>
           </Link>
        </div>

        <p className="mt-16 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-bold text-cyan-400 hover:text-white transition-colors">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

