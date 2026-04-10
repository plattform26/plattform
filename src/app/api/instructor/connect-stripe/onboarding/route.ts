export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Falta la llave secreta de Stripe en el entorno (STRIPE_SECRET_KEY)');
    }

    // 1. Obtener el perfil del instructor
    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 });
    }

    let stripeConnectId = profile.stripeConnectId;

    // 2. Si no tiene cuenta de Connect, crear una Express account en MX
    if (!stripeConnectId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'MX',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: session.userId,
          instructorProfileId: profile.id,
        },
      });
      stripeConnectId = account.id;

      // Persistir el ID en la DB
      await prisma.instructorProfile.update({
        where: { id: profile.id },
        data: { stripeConnectId },
      });
    }

    // 3. Generar el Account Link para el onboarding
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3001').replace(/\/$/, '');
    
    // Validar URLs para Stripe
    const refresh_url = `${baseUrl}/dashboard/instructor/finances?connect=refresh`;
    const return_url = `${baseUrl}/dashboard/instructor/finances?connect=success`;

    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      refresh_url,
      return_url,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('âŒ [STRIPE_ONBOARDING_ERROR]:', error);
    
    return NextResponse.json({ 
      error: 'Error en la conexiÃ³n con la pasarela bancaria', 
      details: error.message,
      code: error.code || 'internal_error'
    }, { status: 500 });
  }
}

