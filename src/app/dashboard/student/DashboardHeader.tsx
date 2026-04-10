'use client';

export default function DashboardHeader({ userName }: { userName: string }) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex items-center justify-between pb-6 border-b border-blue-500/10">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
         Panel del Estudiante <span className="text-cyan-400">v1.0</span>
      </div>
      <div className="flex items-center gap-6">
         <span className="text-xs font-semibold text-gray-400 hidden sm:block">Estudiante: <span className="text-white">{userName}</span></span>
         <button 
           onClick={handleLogout}
           className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-2"
         >
           🚪 Cerrar sesión
         </button>
      </div>
    </div>
  );
}
