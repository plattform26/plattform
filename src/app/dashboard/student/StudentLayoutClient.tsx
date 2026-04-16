'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileMenu from '@/components/ProfileMenu';

export default function StudentLayoutClient({ 
  children,
  session
}: { 
  children: React.ReactNode;
  session: any;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(session);

  const menu = [
    { name: 'Resumen', path: '/dashboard/student', icon: '📊' },
    { name: 'Mis cursos', path: '/dashboard/student/courses', icon: '📚' },
    { name: 'Certificados', path: '/dashboard/student/certificates', icon: '🎓' },
    { name: 'Explorar cursos', path: '/courses', icon: '✨' },
    { name: 'Soporte', path: '/dashboard/student/support', icon: '🎧' },
  ];

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('sidebar-collapsed', String(newVal));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070d1a] text-white">
      {/* SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0d1524] border-r border-blue-500/20 flex flex-col hidden md:flex transition-all duration-300 relative group`}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-blue-500/20 relative`}>
          <Link href="/dashboard/student" className={`font-space-grotesk font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent transition-all ${isCollapsed ? 'scale-75' : ''}`}>
            {isCollapsed ? 'P' : 'PLATTFORM'}
          </Link>
          
          <button 
            onClick={toggleSidebar}
            className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0d1524] border border-blue-500/30 rounded-full flex items-center justify-center text-[10px] text-cyan-400 hover:border-cyan-400 transition-all z-50 opacity-0 group-hover:opacity-100 shadow-lg`}
            title={isCollapsed ? "Expandir menú" : "Ocultar menú"}
          >
            {isCollapsed ? '❯' : '❮'}
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {!isCollapsed && <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-4 px-4 transition-opacity duration-300">Panel del Alumno</div>}
          {menu.map(item => {
            const isActive = pathname === item.path || (item.path !== '/dashboard/student' && pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm group/item ${isCollapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-blue-500/15 text-cyan-400 border border-blue-500/20' : 'text-gray-400 hover:bg-[#152035] hover:text-white'}`}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-xl shrink-0">{item.icon}</span> 
                <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
        <div className={`p-4 border-t border-blue-500/20 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <ProfileMenu user={user} isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* MOBILE NAV (Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1524] border-t border-blue-500/20 flex justify-around p-3 z-50">
        {menu.map(item => (
           <Link key={item.path} href={item.path} className={`text-xl ${pathname === item.path ? 'opacity-100' : 'opacity-40'}`}>{item.icon}</Link>
        ))}
        <button onClick={handleLogout} className="text-xl opacity-40">🚪</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 h-screen overflow-y-auto relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-blue-500/10 bg-[#070d1a]/80 backdrop-blur sticky top-0 z-40">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
             Centro de Aprendizaje <span className="text-cyan-400">v1.2</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-semibold text-gray-400 hidden sm:block">¡Bienvenido!</span>
          </div>
        </header>

        <div className="p-8 pb-32">
          {children}
        </div>
      </main>
    </div>
  );
}
