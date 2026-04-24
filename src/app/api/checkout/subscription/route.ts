import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    
    if (!planId) {
      return NextResponse.json({ error: 'Falta planId' }, { status: 400 });
    }

    const platformPlan = await prisma.platformPlan.findUnique({
      where: { id: planId }
    });

    if (!platformPlan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 });
    }

    // 1. Verificar si ya tiene suscripción activa o crear una nueva
    let sub = await prisma.instructorSubscription.findFirst({
        where: { instructorId: instructorProfile.id }
    });

    if (!sub) {
       sub = await prisma.instructorSubscription.create({
         data: {
           instructorId: instructorProfile.id,
           planId: platformPlan.id,
           status: 'PAST_DUE',
           startedAt: new Date(),
         }
       });
    } else {
        // Si ya existe, actualizamos el plan objetivo
        sub = await prisma.instructorSubscription.update({
            where: { id: sub.id },
            data: { planId: platformPlan.id }
        });
    }

    // 2. Crear Stripe Customer si no tiene
    let stripeCustomerId = sub.stripeCustomerId;
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: userData.email,
            name: `${userData.name} ${userData.lastName}`,
            metadata: { userId: session.userId }
        });
        stripeCustomerId = customer.id;
        await prisma.instructorSubscription.update({
            where: { id: sub.id },
            data: { stripeCustomerId }
        });
    }

    const isUpgrade = !!sub.stripeSubscriptionId;
    const previousSubscriptionId = sub.stripeSubscriptionId;

    // 3. Crear Stripe Session para SUSCRIPCIÓN (Upgrade, Downgrade o Nueva)
    // Todo cambio genera un cobro completo y reinicia el ciclo (30 días)
    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Plattform ${platformPlan.displayName} Plan`,
              description: platformPlan.description || 'Suscripción para Instructores',
            },
            unit_amount: Math.round(Number(platformPlan.monthlyPrice) * 100),
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/instructor/plan?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/instructor/plan?canceled=true`,
      metadata: {
        instructorSubscriptionId: sub.id,
        planId: platformPlan.id,
        transactionType: 'INSTRUCTOR_SUBSCRIPTION',
        isUpgrade: isUpgrade ? 'true' : 'false',
        previousSubscriptionId: previousSubscriptionId || '',
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Create subscription session error:', error);
    return NextResponse.json({ error: 'Error al procesar suscripción', details: error.message }, { status: 500 });
  }
}
