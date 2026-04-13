import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentLayoutClient from './StudentLayoutClient';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Seguridad: Solo Alumnos (o Admins previsualizando)
  if (!session) {
    redirect('/login');
  }

  return (
    <StudentLayoutClient session={session}>
      {children}
    </StudentLayoutClient>
  );
}
