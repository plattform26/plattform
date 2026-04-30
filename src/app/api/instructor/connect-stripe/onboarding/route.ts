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

    // 1. Obtener el perfil del instructor
    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de instructor no encontrado' }, { status: 404 });
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
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL no configurado');
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      refresh_url: `${baseUrl}/dashboard/instructor/finances?connect_status=refresh`,
      return_url: `${baseUrl}/dashboard/instructor/finances?connect_status=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('❌ [STRIPE_ONBOARDING_ERROR]:', error);
    
    return NextResponse.json({ 
      error: 'Error en la conexión con la pasarela bancaria', 
      details: error.message
    }, { status: 500 });
  }
}
