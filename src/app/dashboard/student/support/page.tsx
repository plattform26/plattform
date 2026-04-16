import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StudentSupportPage() {
  const session = await getSession();
  if (!session || (session.role !== 'STUDENT' && session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const supportEmail = "soporte@plattform.mx";
  const whatsappNumber = "+525623194635";
  const whatsappLink = "https://wa.me/525623194635";

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">Centro de <span className="text-cyan-400">Ayuda Estudiantil</span></h1>
           <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold text-[10px] italic">Estamos aquí para acompañar tu proceso de aprendizaje.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EMAIL SUPPORT */}
        <div className="group relative bg-[#152035] border border-blue-500/10 rounded-[40px] p-10 overflow-hidden hover:border-blue-500/30 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
               ✉️
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Atención Académica</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              ¿Tienes problemas con el acceso a tus cursos o dudas sobre tu certificación? Nuestro equipo de soporte está listo para asistirte vía email.
            </p>
            <div className="pt-4">
              <a 
                href={`mailto:${supportEmail}`}
                className="inline-block px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-lg shadow-white/5"
              >
                Enviar correo →
              </a>
              <p className="mt-4 text-[11px] font-mono text-blue-400/60 uppercase font-black">{supportEmail}</p>
            </div>
          </div>
        </div>

        {/* WHATSAPP SUPPORT */}
        <div className="group relative bg-[#152035] border border-cyan-500/10 rounded-[40px] p-10 overflow-hidden hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
               💬
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Soporte Inmediato</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              ¿Necesitas una respuesta rápida sobre el funcionamiento de la plataforma? Conéctate directamente con nuestro equipo de atención por WhatsApp.
            </p>
            <div className="pt-4">
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-[#25D366] text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#25D366]/20"
              >
                Chat WhatsApp →
              </a>
              <p className="mt-4 text-[11px] font-mono text-cyan-400/60 uppercase font-black">{whatsappNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ PREVIEW */}
      <div className="bg-[#152035]/50 border border-white/5 rounded-[40px] p-12 text-center">
         <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Plattform Student Success</h4>
         <p className="text-white text-lg font-medium italic opacity-80">"Tu crecimiento es nuestra prioridad. No dejes que una duda técnica detenga tu aprendizaje."</p>
      </div>
    </div>
  );
}
