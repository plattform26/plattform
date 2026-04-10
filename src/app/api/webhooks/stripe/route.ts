import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const metadata = session.metadata;

        // --- CASO 1: COMPRA DE CURSO ---
        if (metadata.transactionType === 'COURSE_PURCHASE') {
          const { courseId, userId, couponCode } = metadata;

          const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { instructor: true }
          });

          if (!course) throw new Error('Course not found');

          const grossAmount = session.amount_total / 100;
          
          // Calcular comision de plataforma basada en el plan ACTIVO del instructor
          const activeSub = await prisma.instructorSubscription.findFirst({
            where: { 
              instructor: { userId: course.instructorId },
              status: 'ACTIVE'
            },
            include: { plan: true }
          });
          
          const commissionRate = activeSub ? Number(activeSub.plan.commissionRate) : 15;
          const platformCommission = (grossAmount * commissionRate) / 100;
          const netAmount = grossAmount - platformCommission;

          // Obtener detalles del Payment Intent para capturar el Transfer ID y Fees
          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_intent.latest_charge']
          });
          const pi = expandedSession.payment_intent as any;
          const charge = pi?.latest_charge as any;
          const stripeTransferId = charge?.transfer as string;

          // Transacción ACID
          await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Crear Enrollment
            await tx.enrollment.upsert({
              where: { userId_courseId: { userId, courseId } },
              update: { status: 'ACTIVE' },
              create: {
                userId,
                courseId,
                accessType: 'PURCHASE',
                status: 'ACTIVE'
              }
            });

            // 2. Crear Transacción
            await tx.transaction.create({
              data: {
                userId,
                courseId,
                instructorId: course.instructorId,
                paymentType: 'COURSE_PURCHASE',
                grossAmount: grossAmount,
                platformCommissionAmount: platformCommission,
                platformCommissionRate: commissionRate,
                netAmountToInstructor: netAmount,
                paymentStatus: 'SUCCESS',
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
                stripeTransferId: stripeTransferId || null,
              }
            });

            // 3. Notificación al Instructor
            await tx.notification.create({
              data: {
                userId: course.instructorId,
                type: 'COURSE_PURCHASED',
                title: '🎉 Nuevo alumno inscrito',
                message: `Un nuevo alumno ha comprado tu curso: ${course.title}.`,
                relatedEntityType: 'COURSE',
                relatedEntityId: course.id
              }
            });

            // 4. Actualizar estadística de suscripción
            const instructorSubscription = await tx.instructorSubscription.findFirst({
               where: { instructor: { userId: course.instructorId }, status: 'ACTIVE' }
            });
            if (instructorSubscription) {
              await tx.instructorSubscription.update({
                where: { id: instructorSubscription.id },
                data: { activeStudentCount: { increment: 1 } }
              });
            }

            // 5. Incrementar usos de cupón si aplica
            if (couponCode) {
              await tx.coupon.update({
                where: { courseId_code: { courseId, code: couponCode.toUpperCase() } },
                data: { currentUses: { increment: 1 } }
              }).catch(() => null); // Silenciar si no existe o algo falló
            }
          });

          // Enviar email de confirmación (fuera de la transacción por performance)
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            await sendPaymentConfirmationEmail(user.email, user.name, course.title, grossAmount);
          }

          console.log(`Enrollment manual/compra exitosa para User:${userId} en Course:${courseId}`);
        }

        // --- CASO 2: SUSCRIPCIÓN DE INSTRUCTOR (NUEVA O UPGRADE) ---
        if (metadata.transactionType === 'INSTRUCTOR_SUBSCRIPTION') {
          const { instructorSubscriptionId, planId, isUpgrade, previousSubscriptionId } = metadata;

          // Si es un Upgrade (Reinicio de ciclo)
          if (isUpgrade === 'true' && previousSubscriptionId) {
            try {
              // Cancelar la suscripción anterior de inmediato en Stripe para evitar cobros dobles
              await stripe.subscriptions.cancel(previousSubscriptionId);
              console.log(`Stripe: Suscripción antigua ${previousSubscriptionId} cancelada por Upgrade.`);
            } catch (err) {
              console.error(`Error cancelando suscripción antigua ${previousSubscriptionId}:`, err);
              // Continuamos para no dejar al usuario sin su nuevo plan
            }
          }

          // Actualizar la suscripción en nuestra DB (Reinicio de Ciclo)
          await prisma.instructorSubscription.update({
            where: { id: instructorSubscriptionId },
            data: { 
              status: 'ACTIVE',
              planId: planId, // Asegurar que el nuevo plan quede registrado
              stripeSubscriptionId: session.subscription as string,
              startedAt: new Date(), // REINICIO DE CICLO: La fecha de facturación es HOY
            }
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
            // 1. Marcar como activa en DB
            const updatedSubs = await prisma.instructorSubscription.updateMany({
              where: { stripeSubscriptionId: invoice.subscription },
              data: { status: 'ACTIVE' }
            });

            // 2. RECUPERACION: Si el instructor estaba hibernado, desbloquear sus cursos
            if (updatedSubs.count > 0) {
              const sub = await prisma.instructorSubscription.findFirst({
                where: { stripeSubscriptionId: invoice.subscription }
              });
              if (sub) {
                const profile = await prisma.instructorProfile.findUnique({
                  where: { id: sub.instructorId }
                });
                if (profile) {
                  await prisma.course.updateMany({
                    where: { instructorId: profile.userId, status: 'HIBERNATED' },
                    data: { status: 'PUBLISHED' }
                  });
                  console.log(`Stripe: Cursos de Instructor ${profile.userId} deshibernados tras pago exitoso.`);
                }
              }
            }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          // Marcar como PAST_DUE para activar alertas en el Dashboard
          await prisma.instructorSubscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription },
            data: { status: 'PAST_DUE' }
          });
          
          const sub = await prisma.instructorSubscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription }
          });
          
          if (sub) {
            await prisma.notification.create({
              data: {
                userId: sub.instructorId,
                type: 'SYSTEM_ALERT',
                title: '⚠️ Error en el pago de suscripción',
                message: 'No pudimos procesar el cargo de tu plan. Tu academia entrará en hibernación si no se regulariza el pago pronto.'
              }
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as any;
        const sub = await prisma.instructorSubscription.findFirst({
           where: { stripeSubscriptionId: stripeSub.id },
           include: { plan: true }
        });

        if (sub) {
           // Si el plan ha cambiado (detectado por el metadata de Stripe o consultando DB)
           // Aquí simplificamos: el webhook dispara una verificación de cupo
           const totalEnrollments = await prisma.enrollment.count({
              where: { course: { instructorId: sub.instructorId } }
           });

           if (sub.plan.studentLimit !== -1 && totalEnrollments > sub.plan.studentLimit) {
              await prisma.course.updateMany({
                 where: { instructorId: sub.instructorId },
                 data: { status: 'HIBERNATED' }
              });
              
              await prisma.notification.create({
                 data: {
                   userId: sub.instructorId,
                   type: 'SYSTEM_ALERT',
                   title: '⚠️ Cursos Hibernados',
                   message: 'Tu academia ha excedido el límite de tu nuevo plan. Tus cursos han sido hibernados hasta que la capacidad se regularice o subas de plan.'
                 }
              });
           }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as any;
        
        const sub = await prisma.instructorSubscription.findFirst({
           where: { stripeSubscriptionId: stripeSub.id }
        });

        if (sub) {
          await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Cancelar suscripción
            await tx.instructorSubscription.update({
              where: { id: sub.id },
              data: { status: 'CANCELLED' }
            });

            // Hibernar cursos del instructor
            const profile = await tx.instructorProfile.findUnique({
                where: { id: sub.instructorId }
            });
            if (profile) {
              await tx.course.updateMany({
                  where: { instructorId: profile.userId },
                  data: { status: 'HIBERNATED' }
              });
            }
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as any;
        // Podríamos loguear esto en Transactions como FAILED si tenemos el sessionId o metadata
        break;
      }

      case 'account.updated': {
        const account = event.data.object as any;
        
        // Si el onboarding se completó (details_submitted es true)
        if (account.details_submitted) {
          const userId = account.metadata?.userId;
          if (userId) {
            await prisma.instructorProfile.update({
              where: { userId },
              data: { stripeOnboardingComplete: true }
            });
            console.log(`Stripe Connect: Onboarding completado para User:${userId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', details: error.message }, { status: 500 });
  }
}
