import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AICourseWizard from './AICourseWizard';

export default async function NewAICoursePage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  // Misión: Bloqueo de Ruta Preventivo (AI)
  const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { status: true }
  });
  if (user?.status !== 'ACTIVE') {
      redirect('/dashboard/instructor?error=PENDING_APPROVAL');
  }

  const userFull = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isCourtesy: true, courtesyPlan: { select: { name: true, aiEnabled: true } } }
  });

  let activePlan: any = null;
  let isScale = false;

  if (userFull?.isCourtesy && userFull.courtesyPlan) {
      if (!userFull.courtesyPlan.aiEnabled) redirect('/dashboard/instructor/courses/new');
      activePlan = userFull.courtesyPlan;
      isScale = activePlan.name.toLowerCase() === 'scale';
  } else {
      const sub = await prisma.instructorSubscription.findFirst({
        where: { instructor: { userId: session.userId }, status: 'ACTIVE' },
        include: { plan: true }
      });

      if (!sub || !sub.plan.aiEnabled) {
        redirect('/dashboard/instructor/courses/new');
      }
      activePlan = sub.plan;
      isScale = activePlan.name.toLowerCase() === 'scale';
  }

  const charLimit = isScale ? 10000 : 800; // Limits chars for UX

  return <AICourseWizard isScale={isScale} charLimit={charLimit} />;
}
