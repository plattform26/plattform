import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { adminManagePlanSchema } from '@/lib/validations/admin';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = adminManagePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { planId } = validation.data; // planId here is the 'name' field: starter, growth, scale

    const instructorProfileId = params.id;

    // 1. Get the plan
    const plan = await prisma.platformPlan.findUnique({
      where: { name: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 2. Get current active subscription to get 'fromPlanId'
    const currentSub = await prisma.instructorSubscription.findFirst({
      where: { instructorId: instructorProfileId, status: 'ACTIVE' }
    });

    // 3. Deactivate current
    if (currentSub) {
      await prisma.instructorSubscription.update({
        where: { id: currentSub.id },
        data: { status: 'CANCELLED' }
      });
    }

    // 4. Create new subscription
    await prisma.instructorSubscription.create({
      data: {
        instructorId: instructorProfileId,
        planId: plan.id,
        status: 'ACTIVE',
        startedAt: new Date(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year by default for manual admin change
      }
    });

    // 5. Audit History
    await prisma.instructorSubscriptionHistory.create({
      data: {
        instructorId: instructorProfileId,
        fromPlanId: currentSub?.planId || null,
        toPlanId: plan.id,
        reason: 'MANUAL_ADMIN_UPDATE'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
