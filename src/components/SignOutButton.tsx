'use client';

import { useRouter } from 'next/navigation';

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        // Limpiamos cache y redirigimos
        router.refresh();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className={className || "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left"}
    >
      <span>🚪</span> Cerrar sesión
    </button>
  );
}
