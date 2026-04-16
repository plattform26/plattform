'use client';
import { useState, useEffect } from 'react';

export default function TermsPage() {
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

  const getDashboardRoute = (role?: string) => {
    switch (role) {
      case 'ADMIN': return '/dashboard/admin';
      case 'INSTRUCTOR': return '/dashboard/instructor';
      case 'STUDENT': return '/dashboard/student';
      default: return '/';
    }
  };

  const dashboardHref = user ? getDashboardRoute(user.role) : '/';

  return (
    <div className="min-h-screen bg-[#070d1a] text-white selection:bg-cyan-500/30">
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-[#070d1a]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href={dashboardHref} className="font-space-grotesk font-black text-2xl tracking-tighter italic bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">PLATTFORM</Link>
        <Link href={dashboardHref} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">
          {user ? 'Regresar al Dashboard' : 'Volver al Inicio'}
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto py-24 px-6 md:px-0">
        <h1 className="font-space-grotesk text-5xl font-black mb-12 italic uppercase tracking-tighter">Términos de <span className="text-cyan-400">Servicio</span></h1>
        
        <div className="space-y-12 text-gray-400 leading-relaxed text-sm">
          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar PLATTFORM, usted acepta cumplir y estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">2. Uso de la Plataforma</h2>
            <p>Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. PLATTFORM se reserva el derecho de retirar o modificar el servicio sin previo aviso.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">3. Propiedad Intelectual</h2>
            <p>Todo el contenido presente en esta plataforma, incluyendo textos, gráficos, logos e iconos, es propiedad de PLATTFORM o de sus respectivos creadores de cursos (Instructores) y está protegido por las leyes de propiedad intelectual internacionales.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">4. Limitación de Responsabilidad</h2>
            <p>PLATTFORM no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo que resulte de su acceso o uso de los servicios.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-12 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
        © 2026 PLATTFORM · THE ELITE LEARNING EXPERIENCE
      </footer>
    </div>
  );
}
