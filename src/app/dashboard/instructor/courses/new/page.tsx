import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import NewCourseClient from './NewCourseClient';

export default async function NewCoursePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  const isAdmin = session.role === 'ADMIN';
  const isInstructor = session.role === 'INSTRUCTOR';

  if (!isAdmin && !isInstructor) redirect('/dashboard/student');

  let aiEnabled = false;
  let instructors: any[] = [];

  if (isAdmin) {
      // Admin bypasses subscription check and gets all instructors
      aiEnabled = true; // Admins always have AI features enabled by default
      const profiles = await prisma.instructorProfile.findMany({
          include: { user: { select: { name: true, lastName: true } } }
      });
      instructors = profiles.map(p => ({
          id: p.userId,
          name: p.academyName || `${p.user.name} ${p.user.lastName}`
      }));
  } else {
      // Instructor check
      const sub = await prisma.instructorSubscription.findFirst({
        where: { 
          instructor: { userId: session.userId },
          status: 'ACTIVE'
        },
        include: { plan: true },
      });
      if (sub && sub.plan.aiEnabled) {
        aiEnabled = true;
      }
  }

  return <NewCourseClient aiEnabled={aiEnabled} instructors={instructors} />;
}
