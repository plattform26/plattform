'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import ProfileMenu from '@/components/ProfileMenu';

export default function InstructorLayoutClient({ 
  children,
  session
}: { 
  children: React.ReactNode;
  session: any;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(session);

  const instructorMenu = [
    { name: 'Resumen', path: '/dashboard/instructor', icon: '💎' },
    { name: 'Mis cursos', path: '/dashboard/instructor/courses', icon: '📚' },
    { name: 'Alumnos', path: '/dashboard/instructor/students', icon: '⚡' },
    { name: 'Finanzas', path: '/dashboard/instructor/finances', icon: '📊' },
    { name: 'Soporte', path: '/dashboard/instructor/support', icon: '🎧' },
  ];

  const adminMenu = [
    { name: 'Resumen', path: '/dashboard/admin', icon: '📊' },
    { name: 'Usuarios', path: '/dashboard/admin/users', icon: '👥' },
    { name: 'Cursos', path: '/dashboard/admin/courses', icon: '📚' },
    { name: 'Transacciones', path: '/dashboard/admin/transactions', icon: '💸' },
    { name: 'Rentas', path: '/dashboard/admin/revenue/rent', icon: '🏢' },
    { name: 'Comisiones', path: '/dashboard/admin/revenue/commissions', icon: '💰' },
    { name: 'Inscripción Manual', path: '/dashboard/admin/enrollments/manual', icon: '✍️' },
    { name: 'Soporte', path: '/dashboard/instructor/support', icon: '🎧' },
  ];

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);

    // Misión Extra: Sincronización de Sesión Real-time
    // Como el JWT es estático, consultamos /api/auth/me para ver si el status en DB cambió (ej. email verificado)
    const refreshUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Error refreshing session:', err);
      }
    };
    refreshUser();
  }, []);

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('sidebar-collapsed', String(newVal));
  };

  const menu = user?.role === 'ADMIN' ? adminMenu : instructorMenu;
  const isAdm = user?.role === 'ADMIN';

  return (
    <div className="flex min-h-screen bg-[#070d1a] text-white">
      <Toaster richColors position="top-right" />
      {/* SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0d1524] border-r ${isAdm ? 'border-cyan-500/20' : 'border-blue-500/20'} flex flex-col hidden md:flex transition-all duration-300 relative group`}>
        <div className={`p-6 border-b border-blue-500/20 relative ${isCollapsed ? 'flex justify-center' : ''}`}>
          <Link 
            href={isAdm ? "/dashboard/admin" : "/dashboard/instructor"} 
            className={`font-space-grotesk font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 transition-all hover:opacity-80 cursor-pointer ${isCollapsed ? 'text-xl' : 'text-2xl'}`}
          >
            {isCollapsed ? 'P' : (
              isAdm ? (
                <>PLATTFORM<span className="text-[10px] align-top ml-1 text-blue-500 bg-blue-500/10 px-1 rounded">ADMIN</span></>
              ) : (
                <>PLATTFORM<span className="text-[10px] align-top ml-1 text-cyan-600">INSTRUCTOR</span></>
              )
            )}
          </Link>
          
          <button 
            onClick={toggleSidebar}
            className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0d1524] border ${isAdm ? 'border-cyan-500/30' : 'border-blue-500/30'} rounded-full flex items-center justify-center text-[10px] text-cyan-400 hover:border-cyan-400 transition-all z-50 opacity-0 group-hover:opacity-100 shadow-lg`}
            title={isCollapsed ? "Expandir menú" : "Ocultar menú"}
          >
            {isCollapsed ? '❯' : '❮'}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 custom-scrollbar overflow-y-auto overflow-x-hidden">
          {menu.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm group/item ${isCollapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/20' : 'text-gray-400 hover:bg-blue-600/10 hover:text-white'}`}
                title={isCollapsed ? item.name : ''}
              >
                <span className="shrink-0 text-xl">{item.icon}</span> 
                <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-blue-500/20 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <ProfileMenu user={user} isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1524] border-t border-blue-500/20 flex justify-around p-3 z-50">
        {menu.map(item => (
           <Link key={item.path} href={item.path} className={`text-xl ${pathname === item.path ? 'opacity-100' : 'opacity-40'}`}>{item.icon}</Link>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 h-screen overflow-y-auto font-poppins relative">
        {/* Misión: Banners de Alta Jerarquía y Sticky */}
        <div className="sticky top-0 z-[60] flex flex-col shadow-2xl">
          {/* Alerta por falta de Verificación */}
          {!user?.isEmailVerified && (
            <div className="bg-amber-500/10 backdrop-blur-md border-b border-amber-500/20 px-8 py-3 flex items-center justify-between group animate-pulse-slow">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                  Cuenta no verificada. Por favor, revisa tu bandeja de entrada para activar todas las funciones.
                </p>
              </div>
              <div className="text-[9px] font-bold text-amber-500/50 uppercase italic group-hover:text-amber-500 transition-colors cursor-default">
                Acceso Limitado
              </div>
            </div>
          )}

          {/* Flujo de Aprobación - Banner Post-Pago (Bypassed if Courtesy) */}
          {user?.isEmailVerified && user?.status === 'PENDING_APPROVAL' && !user?.isCourtesy && (
            <div className="bg-blue-500/10 backdrop-blur-md border-b border-blue-500/20 px-8 py-3 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className="text-xl">🛡️</span>
                <p className="text-[11px] font-black uppercase tracking-widest text-blue-400">
                  Tu suscripción está en proceso de validación manual. Pronto tendrás acceso a todas las funciones de publicación.
                </p>
              </div>
              <div className="text-[9px] font-bold text-blue-500/50 uppercase italic group-hover:text-blue-500 transition-colors cursor-default">
                Validación en Curso
              </div>
            </div>
          )}
        </div>

        <header className="h-16 flex items-center justify-between px-8 border-b border-blue-500/10 bg-[#070d1a]/80 backdrop-blur sticky top-0 z-40">
          <div className="text-sm font-medium text-gray-300 uppercase tracking-widest text-[10px]">
             {isAdm ? 'Consola de Comando Maestro' : 'Panel de Instructor'}
          </div>
          <Link href="/courses" className="px-4 py-1.5 rounded bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-cyan-400 hover:bg-blue-500/20 transition-colors">Ver Catálogo Público →</Link>
        </header>

        <div className="p-8 pb-32">
          {children}
        </div>
      </main>
    </div>
  );
}
