import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Seguridad: Solo Admins
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const navItems = [
    { label: 'Resumen', href: '/dashboard/admin', icon: '📊' },
    { label: 'Usuarios', href: '/dashboard/admin/users', icon: '👥' },
    { label: 'Cursos', href: '/dashboard/admin/courses', icon: '📚' },
    { label: 'Transacciones', href: '/dashboard/admin/transactions', icon: '💸' },
    { label: 'Rentas', href: '/dashboard/admin/revenue/rent', icon: '🏢' },
    { label: 'Comisiones', href: '/dashboard/admin/revenue/commissions', icon: '💰' },
    { label: 'Inscripción Manual', href: '/dashboard/admin/enrollments/manual', icon: '✍️' },
  ];

  return (
    <AdminLayoutClient session={session as any} navItems={navItems}>
      {children}
    </AdminLayoutClient>
  );
}
