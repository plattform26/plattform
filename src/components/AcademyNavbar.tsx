'use client';

import Link from 'next/link';

interface AcademyNavbarProps {
  profile: {
    academyName?: string;
    name?: string;
    logoUrl?: string;
  };
  session?: any; // Recibimos la sesión desde el servidor para evitar dependencia de next-auth
}

export default function AcademyNavbar({ profile, session }: AcademyNavbarProps) {
  const dashboardRoute = session?.role === 'ADMIN' 
    ? '/dashboard/admin' 
    : '/dashboard/instructor';

  return (
    <nav className="flex items-center justify-between px-4 sm:px-10 h-16 bg-[#070d1a]/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      {/* LOGO & BRANDING */}
      <Link href="/" className="flex items-center gap-2.5 group">
        {profile.logoUrl ? (
          <img src={profile.logoUrl} className="h-7 w-7 rounded-lg object-cover border border-white/10" alt="Logo" />
        ) : (
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-[9px] font-black italic">P</div>
        )}
        <span className="font-space-grotesk font-black text-base sm:text-lg tracking-tighter bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity uppercase text-center md:text-left">
          {profile.academyName || 'PLATTFORM'}
        </span>
      </Link>

      {/* INTELLIGENT NAVIGATION */}
      <div className="flex items-center gap-6">
        {session ? (
          <Link 
            href={dashboardRoute}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest"
          >
            Regresar al Dashboard 🏠
          </Link>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
                href="/" 
                className="hidden md:block text-[10px] font-black text-slate-300 hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
                Explorar plataformas 🚀
            </Link>
            <Link 
                href="/login" 
                className="px-6 py-2 rounded-full bg-white text-black text-[10px] font-black hover:bg-gray-200 transition-all uppercase tracking-widest shadow-lg shadow-white/5"
            >
                Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
