import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import NewCourseClient from './NewCourseClient';

export default async function NewCoursePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  const isAdmin = session.role === 'ADMIN';
  const isInstructor = session.role === 'INSTRUCTOR';
  let aiEnabled = false;

  if (!isAdmin && !isInstructor) redirect('/dashboard/student');

  // Misión: Bloqueo de Ruta Preventivo (Bypassed if Courtesy)
  if (isInstructor) {
      const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { status: true, isCourtesy: true, courtesyPlanId: true }
      });
      if (user?.status !== 'ACTIVE' && !user?.isCourtesy) {
          redirect('/dashboard/instructor?error=PENDING_APPROVAL');
      }

      // If courtesy, fetch the plan to check for AI features
      if (user?.isCourtesy && user.courtesyPlanId) {
          const courtesyPlan = await prisma.platformPlan.findUnique({ where: { id: user.courtesyPlanId } });
          if (courtesyPlan?.aiEnabled) aiEnabled = true;
      }
  }

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
      // Instructor check (Courtesy First, then Standard Stripe Sub)
      const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { isCourtesy: true, courtesyPlan: { select: { aiEnabled: true } } }
      });

      if (user?.isCourtesy && user.courtesyPlan?.aiEnabled) {
          aiEnabled = true;
      } else {
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
  }

  return <NewCourseClient aiEnabled={aiEnabled} instructors={instructors} />;
}
