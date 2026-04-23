import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const plan = await prisma.platformPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Create or get Stripe Customer
    // Check if user already has a customer ID in any subscription
    const existingSub = await prisma.instructorSubscription.findFirst({
      where: { instructor: { userId: user.id } },
      select: { stripeCustomerId: true }
    });

    let stripeCustomerId = existingSub?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.name} ${user.lastName}`,
        metadata: {
          userId: user.id
        }
      });
      stripeCustomerId = customer.id;
    }

    // 2. Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Plattform ${plan.displayName} Plan`,
              description: 'Suscripción para Instructores en Plattform',
            },
            unit_amount: Math.round(Number(plan.monthlyPrice) * 100),
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: plan.id,
        transactionType: 'INSTRUCTOR_SUBSCRIPTION'
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/instructor/plan?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/instructor/plan?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
