'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface Session {
  name: string;
  lastName: string;
  email: string;
  role: string;
}

export default function AdminLayoutClient({ 
  children, 
  session, 
  navItems 
}: { 
  children: React.ReactNode; 
  session: Session;
  navItems: NavItem[];
}) {
  const pathname = usePathname();
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

  return (
    <div className="flex min-h-screen bg-[#070d1a] text-white font-poppins">
      {/* SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0d1524] border-r border-blue-500/10 flex flex-col sticky top-0 h-screen transition-all duration-300 relative group`}>
        <div className={`p-8 border-b border-blue-500/10 relative ${isCollapsed ? 'flex justify-center' : ''}`}>
           <Link href="/dashboard/admin" className="font-space-grotesk font-bold tracking-tighter flex items-center">
              <span className={`bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent transition-all ${isCollapsed ? 'text-xl' : 'text-2xl'}`}>
                {isCollapsed ? 'P' : 'PLATTFORM'}
              </span>
              {!isCollapsed && <span className="text-[10px] ml-1 bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">ADMIN</span>}
           </Link>
           
           <button 
             onClick={toggleSidebar}
             className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0d1524] border border-blue-500/30 rounded-full flex items-center justify-center text-[10px] text-cyan-400 hover:border-cyan-400 transition-all z-50 opacity-0 group-hover:opacity-100 shadow-lg"
             title={isCollapsed ? "Expandir menú" : "Ocultar menú"}
           >
             {isCollapsed ? '❯' : '❮'}
           </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar pt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm border border-transparent group ${isCollapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-blue-600/20 text-cyan-400 border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-blue-600/10'}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="text-xl group-hover:scale-110 transition-transform shrink-0">{item.icon}</span>
                <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-blue-500/10">
           <div className={`flex items-center gap-3 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-4 ${isCollapsed ? 'p-2 justify-center' : 'px-4 py-3'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                 {session.name?.[0] || 'A'}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                   <p className="text-xs font-bold truncate">{session.name} {session.lastName}</p>
                   <p className="text-[10px] text-gray-500 truncate">{session.email}</p>
                </div>
              )}
           </div>
           
           <SignOutButton className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all uppercase tracking-widest ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? '🚪' : 'Cerrar Sesión'}
           </SignOutButton>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>
    </div>
  );
}
