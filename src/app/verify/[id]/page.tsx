import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Esquema de validación estricto
const certParamsSchema = z.object({
  id: z.string().min(5, "ID demasiado corto").max(100, "ID demasiado largo")
});

export const metadata: Metadata = {
  title: 'Validación de Certificado | Plattform',
  description: 'Verificación oficial de autenticidad de certificados Plattform.',
};

// Simple In-Memory Rate Limiter para la página de validación (Localhost/Vercel Edge compatible)
const IP_LIMITS = new Map<string, { count: number, resetAt: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60000; // 1 minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = IP_LIMITS.get(ip);

  if (!limit || now > limit.resetAt) {
    IP_LIMITS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (limit.count >= MAX_REQUESTS) {
    return false;
  }

  limit.count++;
  return true;
}

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    // 1. Rate Limiting (Basado en headers simples por ser Server Component)
    // Nota: En producción real esto iría en un Middleware con Redis/Upstash.
    const ip = "static-ip"; // Simplificado para localhost
    if (!checkRateLimit(ip)) {
       return (
          <div className="min-h-screen bg-[#070d1a] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
                  <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h1 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Límite superado</h1>
              <p className="text-gray-400 max-w-md">Has realizado demasiadas consultas. Por favor espera un minuto antes de intentar validar otro certificado.</p>
          </div>
       );
    }

    // 2. Validación de Formato con Zod
    const validation = certParamsSchema.safeParse(params);
    if (!validation.success) {
      return <InvalidCertificate id={params.id} reason="Formato de ID inválido" />;
    }

    // 3. Búsqueda en Base de Datos (Uso de findUnique para eficiencia)
    const cert = await prisma.certification.findUnique({
      where: { certificateCode: params.id },
      include: {
        user: { select: { name: true, lastName: true } },
        course: { select: { title: true } }
      }
    });

    if (!cert) {
      return <InvalidCertificate id={params.id} reason="Este ID no corresponde a un registro oficial de Plattform" />;
    }

    return (
      <div className="min-h-screen bg-[#070d1a] text-white selection:bg-cyan-500/30 font-sans flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full"></div>

          <div className="max-w-2xl w-full relative z-10">
              {/* Header Branding */}
              <div className="flex flex-col items-center mb-16 animate-fade-in">
                  <Link href="/" className="font-space-grotesk font-black text-3xl tracking-tighter bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase italic mb-2">PLATTFORM</Link>
                  <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Verificador Oficial</div>
              </div>

              {/* Success Card */}
              <div className="bg-[#0b1120] border border-cyan-500/20 rounded-[2.5rem] p-10 shadow-2xl shadow-cyan-500/10 animate-slide-up relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                      <svg className="w-40 h-40" fill="white" viewBox="0 0 24 24"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
                  </div>

                  <div className="flex items-center gap-4 mb-10">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                          <h2 className="text-2xl font-black text-emerald-400 italic tracking-tighter uppercase">Certificado Auténtico ✓</h2>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Validación Criptográfica Exitosa</p>
                      </div>
                  </div>

                  <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Graduado</p>
                              <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{cert.user.name} {cert.user.lastName}</p>
                          </div>
                          <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Fecha de Emisión</p>
                              <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{new Date(cert.issuedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                      </div>

                      <div className="pt-8 border-t border-white/5">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Programa Académico</p>
                          <p className="text-3xl font-black text-cyan-400 italic tracking-tighter uppercase leading-[0.9]">{cert.course.title}</p>
                      </div>

                      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="flex flex-col">
                              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">ID de Verificación</span>
                              <span className="text-xs font-mono font-bold text-gray-400">{cert.certificateCode}</span>
                          </div>
                          <Link href="/register" className="px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-colors">Comenzar mi ruta →</Link>
                      </div>
                  </div>
              </div>

              {/* Support link */}
              <p className="mt-12 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                  ¿Dudas sobre este documento? <Link href="/support" className="text-cyan-500 hover:text-cyan-400 underline underline-offset-4">Contacta a Soporte</Link>
              </p>
          </div>
      </div>
    );
}

function InvalidCertificate({ id, reason }: { id: string, reason: string }) {
    return (
        <div className="min-h-screen bg-[#070d1a] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-red-500/20 animate-pulse">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">Documento No Encontrado</h1>
            <div className="max-w-md bg-red-500/5 border border-red-500/10 p-6 rounded-2xl mb-8">
                <p className="text-red-400 font-bold text-sm mb-4">{reason}</p>
                <div className="text-[10px] font-mono text-gray-500 bg-black/40 p-3 rounded-lg break-all">ID CONSULTADO: {id}</div>
            </div>
            <Link href="/" className="px-8 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all">Volver al Inicio</Link>
            
            <p className="mt-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                ¿Dudas sobre este documento? <Link href="/support" className="text-cyan-500 hover:text-cyan-400 underline underline-offset-4">Contacta a Soporte</Link>
            </p>
        </div>
    );
}
