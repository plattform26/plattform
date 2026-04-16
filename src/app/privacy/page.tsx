'use client';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070d1a] text-white selection:bg-cyan-500/30">
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-[#070d1a]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="font-space-grotesk font-black text-2xl tracking-tighter italic bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">PLATTFORM</Link>
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">Volver al Inicio</Link>
      </nav>

      <main className="max-w-4xl mx-auto py-24 px-6 md:px-0">
        <h1 className="font-space-grotesk text-5xl font-black mb-12 italic uppercase tracking-tighter">Política de <span className="text-cyan-400">Privacidad</span></h1>
        
        <div className="space-y-12 text-gray-400 leading-relaxed text-sm">
          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">1. Recopilación de Información</h2>
            <p>Recopilamos información personal que usted nos proporciona directamente al registrarse, suscribirse a nuestro boletín o comunicarse con nosotros para soporte técnico.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">2. Uso de los Datos</h2>
            <p>Sus datos son utilizados para procesar transacciones, personalizar su experiencia de aprendizaje, mejorar nuestra plataforma y cumplir con nuestras obligaciones legales.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">3. Compartir con Terceros</h2>
            <p>No vendemos su información personal. Compartimos datos con procesadores de pago (como Stripe) y servicios de infraestructura técnica únicamente para el funcionamiento del servicio.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">4. Sus Derechos</h2>
            <p>Usted tiene derecho a acceder, rectificar o eliminar su información personal. En PLATTFORM, usted es el dueño de sus datos y puede exportarlos en cualquier momento.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-12 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
        © 2026 PLATTFORM · THE ELITE LEARNING EXPERIENCE
      </footer>
    </div>
  );
}
