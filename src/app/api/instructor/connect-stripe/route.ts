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

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    if (!baseUrl) throw new Error('NEXT_PUBLIC_APP_URL no configurado');

    let stripeConnectId = profile.stripeConnectId;

    // Función auxiliar para crear una cuenta nueva y guardar su ID
    const createNewStripeAccount = async () => {
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
      
      await prisma.instructorProfile.update({
        where: { id: profile.id },
        data: { stripeConnectId: account.id },
      });
      
      return account.id;
    };

    // 2. Si no tiene ID, crearlo
    if (!stripeConnectId) {
      stripeConnectId = await createNewStripeAccount();
    }

    // 3. Intentar generar el Account Link con el ID actual
    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeConnectId as string,
        type: 'account_onboarding',
        refresh_url: `${baseUrl}/dashboard/instructor/finances?connect_status=refresh`,
        return_url: `${baseUrl}/dashboard/instructor/finances?connect_status=success`,
      });

      return NextResponse.json({ url: accountLink.url });
    } catch (stripeError: any) {
      // AUTO-REPARACIÓN: Si Stripe dice que la cuenta no existe o no está vinculada
      if (stripeError.raw?.type === 'invalid_request_error' || stripeError.statusCode === 400) {
        console.warn('⚠️ [STRIPE_AUTO_REPAIR]: ID inválido detectado. Recreando cuenta...');
        
        // Creamos una cuenta nueva desde cero
        const newId = await createNewStripeAccount();
        
        // Intentamos generar el link con el nuevo ID
        const newAccountLink = await stripe.accountLinks.create({
          account: newId,
          type: 'account_onboarding',
          refresh_url: `${baseUrl}/dashboard/instructor/finances?connect_status=refresh`,
          return_url: `${baseUrl}/dashboard/instructor/finances?connect_status=success`,
        });

        return NextResponse.json({ url: newAccountLink.url });
      }
      
      throw stripeError; // Si es otro tipo de error, lo lanzamos
    }

  } catch (err: any) {
    console.error('❌ [STRIPE_CONNECT_DYNAMIC_ERROR]:', err);
    return NextResponse.json({ 
      error: 'Error en la conexión con la pasarela bancaria',
      details: err.message 
    }, { status: 500 });
  }
}
