'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RefundsPage() {
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
        <h1 className="font-space-grotesk text-5xl font-black mb-12 italic uppercase tracking-tighter">Política de <span className="text-cyan-400">Reembolsos</span></h1>
        
        <div className="space-y-12 text-gray-400 leading-relaxed text-sm">
          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">1. Transparencia en el Consumo</h2>
            <p>Debido a la naturaleza digital de nuestros cursos y el acceso instantáneo al contenido, las políticas de reembolso varían según el uso del material.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">2. Ventana de Reembolso</h2>
            <p>Los alumnos pueden solicitar un reembolso completo dentro de las primeras 48 horas tras la compra, siempre y cuando no se haya visualizado más del 10% del contenido del curso.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">3. Proceso de Solicitud</h2>
            <p>Para iniciar una solicitud, debe contactar a nuestro equipo de soporte vía WhatsApp o correo electrónico proporcionando su comprobante de pago y el motivo de la solicitud.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">4. Excepciones</h2>
            <p>No se otorgarán reembolsos por suscripciones de planes para instructores (Creators) una vez iniciado el periodo de facturación mensual.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-12 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
        © 2026 PLATTFORM · THE ELITE LEARNING EXPERIENCE
      </footer>
    </div>
  );
}
