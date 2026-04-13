import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InstructorLayoutClient from './InstructorLayoutClient';

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Seguridad: Solo Instructores o Admins
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  return (
    <InstructorLayoutClient session={session}>
      {children}
    </InstructorLayoutClient>
  );
}
