'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InstructorProfilePage from '@/app/dashboard/instructor/profile/page';
import StudentProfilePage from '@/app/dashboard/student/profile/page';

export default function AdminImpersonationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role'); // 'instructor' o 'student'
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        
        if (res.ok && !data.error) {
          setUser(data);
        } else {
          const errMsg = data.error || 'Error desconocido del servidor';
          console.warn('⚠️ [ADMIN_UI] Error en fetch:', errMsg);
          setError(errMsg);
        }
      } catch (error: any) {
        console.error('🔥 [ADMIN_UI_CRASH] Error crítico:', error);
        setError(error.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, router]);

  // Si tenemos el rol por URL, cargamos la UI inmediatamente sin esperar al fetch
  const effectiveRole = user?.role?.toLowerCase() || roleFromUrl;

  if (loading && !effectiveRole) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse italic">
          Sincronizando Identidad Maestra...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* CABECERA DE MODO DIOS */}
      <div className="bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500 p-6 rounded-r-3xl mb-12">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🛡️</span>
          <div>
            <h2 className="text-xs font-black text-red-500 uppercase tracking-widest italic">Modo Administrador Activo (GOD MODE)</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-1">
              {loading ? (
                <span className="animate-pulse">Cargando datos del objetivo...</span>
              ) : (
                <>Estás editando el perfil de <span className="text-white font-black">[{user?.name || 'Usuario'} {user?.lastName || ''}]</span> con privilegios totales.</>
              )}
            </p>
            {error && <p className="text-[9px] text-red-400 mt-2 font-mono uppercase font-black tracking-widest bg-red-500/10 px-2 py-1 inline-block rounded">⚠️ {error}</p>}
          </div>
        </div>
      </div>

      {effectiveRole === 'instructor' ? (
        <InstructorProfilePage searchParams={{ impersonateId: id, isAdminMode: 'true' }} />
      ) : effectiveRole === 'student' ? (
        <StudentProfilePage searchParams={{ impersonateId: id, isAdminMode: 'true' }} />
      ) : (
        <div className="p-20 text-center text-gray-500 uppercase text-[10px] font-black tracking-widest italic border border-dashed border-white/5 rounded-3xl">
          Esperando definición de identidad del sujeto...
        </div>
      )}
    </div>
  );
}
