import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Obtener perfil del instructor
    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de instructor no encontrado' }, { status: 404 });
    }

    let stripeConnectId = profile.stripeConnectId;

    // 2. Si no tiene cuenta, crearla (Express account en MX)
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

      // Guardar el ID en la BD
      await prisma.instructorProfile.update({
        where: { id: profile.id },
        data: { stripeConnectId },
      });
    }

    // 3. Generar Account Link para el onboarding
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    
    // Si no hay baseUrl, avisar (para evitar redirecciones rotas)
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL no está configurado');
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      type: 'account_onboarding',
      refresh_url: `${baseUrl}/dashboard/instructor/finances?connect_status=refresh`,
      return_url: `${baseUrl}/dashboard/instructor/finances?connect_status=success`,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('❌ [STRIPE_CONNECT_DYNAMIC_ERROR]:', err);
    return NextResponse.json({ 
      error: 'Error en la conexión con la pasarela bancaria',
      details: err.message 
    }, { status: 500 });
  }
}
