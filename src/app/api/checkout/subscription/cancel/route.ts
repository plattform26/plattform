import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body; // 'cancel' o 'reactivate'

    if (action !== 'cancel' && action !== 'reactivate') {
      return NextResponse.json({ error: 'Acción inválida. Debe ser cancel o reactivate.' }, { status: 400 });
    }

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Perfil de instructor no encontrado' }, { status: 404 });
    }

    // Buscar la suscripción activa
    const sub = await prisma.instructorSubscription.findFirst({
      where: { 
        instructorId: instructorProfile.id,
        status: { in: ['ACTIVE', 'PAST_DUE'] }
      }
    });

    if (!sub || !sub.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No tienes una suscripción activa de Stripe para gestionar' }, { status: 400 });
    }

    const cancelAtPeriodEnd = action === 'cancel';

    // 1. Actualizar en Stripe
    try {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      });
    } catch (stripeErr: any) {
      console.error(`Stripe subscription update failed (${action}):`, stripeErr.message);
      return NextResponse.json({ error: `Stripe Error: ${stripeErr.message}` }, { status: 500 });
    }

    // 2. Sincronizar de inmediato el estado local de la base de datos
    // Mantenemos status: ACTIVE para el periodo de gracia.
    const newStatus = 'ACTIVE';

    await prisma.instructorSubscription.update({
      where: { id: sub.id },
      data: { status: newStatus }
    });

    // Buscar y actualizar el SubscriptionRecord correspondiente
    const record = await prisma.subscriptionRecord.findFirst({
      where: { userId: session.userId, planId: sub.planId, status: { in: ['ACTIVE', 'PAST_DUE'] } }
    });

    if (record) {
      await prisma.subscriptionRecord.update({
        where: { id: record.id },
        data: { status: newStatus }
      });
    }

    return NextResponse.json({ 
      success: true, 
      action,
      message: action === 'cancel' 
        ? 'Renovación automática desactivada con éxito.' 
        : 'Renovación automática reactivada con éxito.'
    });

  } catch (error: any) {
    console.error('Subscription cancel/reactivate error:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud', details: error.message }, { status: 500 });
  }
}
