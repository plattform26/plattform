import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { 
  sendPaymentConfirmationEmail, 
  sendSaleNotificationToInstructor, 
  sendAdminTechnicalAlert,
  sendPlanActivityEmail,
  sendSaleNotificationToAdmin,
  sendSubscriptionNotificationToAdmin
} from '@/lib/mail';
import { Prisma } from '@prisma/client';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
// Total Reset Trigger: Domain sync & Webhook secret update for plattform-rouge.vercel.app

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
        const userId = metadata.userId;



        if (!userId) {
          console.error('CRITICAL: Webhook arrived without userId in metadata.');
          return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 });
        }

        // --- Misión: Resolución de URL Dinámica ---
        const url = session.success_url ? new URL(session.success_url).origin : (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL);

        // --- CASO 1: COMPRA DE CURSO ---
        if (metadata.transactionType === 'COURSE_PURCHASE') {
          const { courseId, couponCode } = metadata;

          const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { instructor: true }
          });

          if (!course) throw new Error('Course not found');

          const grossAmount = session.amount_total / 100;
          
          const activeSub = await prisma.instructorSubscription.findFirst({
            where: { 
              instructor: { userId: course.instructorId },
              status: 'ACTIVE'
            },
            include: { plan: true }
          });
          
          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_intent.latest_charge']
          });
          const pi = expandedSession.payment_intent as any;
          
          // EXTRAER COMISIÓN REAL DE STRIPE (APPLICATION FEE)
          // Stripe otorga el fee en centavos, convertimos a pesos/decimal
          const commissionRate = activeSub ? Number(activeSub.plan.commissionRate) : 15;
          const platformCommission = pi.application_fee_amount 
            ? (pi.application_fee_amount / 100) 
            : (grossAmount * commissionRate) / 100;
            
          const netAmount = grossAmount - platformCommission;
          const charge = pi?.latest_charge as any;
          const stripeTransferId = charge?.transfer as string;

          await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

            // Actualizar estadística de suscripción
            const instructorSubscription = await tx.instructorSubscription.findFirst({
               where: { instructor: { userId: course.instructorId }, status: 'ACTIVE' }
            });
            if (instructorSubscription) {
              await tx.instructorSubscription.update({
                where: { id: instructorSubscription.id },
                data: { activeStudentCount: { increment: 1 } }
              });
            }

            if (couponCode) {
              const coupon = await tx.coupon.findUnique({
                where: { code: couponCode.toUpperCase().trim() }
              });

              if (coupon) {
                // Registrar uso individual para seguimiento y prevención de duplicados
                await tx.couponUsage.create({
                  data: {
                    userId: userId,
                    couponId: coupon.id
                  }
                });

                
                // Guardar info para los correos
                (session as any)._discountInfo = {
                  code: coupon.code,
                  percent: coupon.discountPercent
                };
              }
            }
          });

          const userRecord = await prisma.user.findUnique({ where: { id: userId } });
          const instructorUser = await prisma.user.findUnique({ where: { id: course.instructorId } });
          const discountInfo = (session as any)._discountInfo;

          if (userRecord) {
            await sendPaymentConfirmationEmail(userRecord.email, userRecord.name, course.title, grossAmount, discountInfo, url);
          }
          if (instructorUser) {
            await sendSaleNotificationToInstructor(instructorUser.email, userRecord?.name || 'Un alumno', course.title, url);
          }

          // Misión: Blindaje de Negocio - Notificar al admin (Diego)
          await sendSaleNotificationToAdmin(userRecord?.name || 'Un alumno', course.title, grossAmount, discountInfo, url);

          console.log(`✅ SUCCESS: Pago procesado para User:${userId} en Course:${courseId}`);
        }

        // --- CASO 2: SUSCRIPCIÓN DE INSTRUCTOR ---
        if (metadata.transactionType === 'INSTRUCTOR_SUBSCRIPTION') {
          const { planId } = metadata;

          const plan = await prisma.platformPlan.findUnique({ where: { id: planId } });
          if (!plan) throw new Error('Plan not found');

          // 1. Obtener o Crear Perfil de Instructor
          let profile = await prisma.instructorProfile.findUnique({
            where: { userId }
          });

          if (!profile) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error('User not found for subscription');
            
            const slugBase = user.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
            profile = await prisma.instructorProfile.create({
              data: {
                userId: user.id,
                academyName: `${user.name} Academy`,
                slug: `${slugBase}-${user.id.substring(0, 5)}`,
                commissionRate: plan.commissionRate,
              }
            });
          }

          const now = new Date();
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

          await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // A. Caducar suscripciones anteriores
            await tx.instructorSubscription.updateMany({
              where: { instructorId: profile!.id, status: 'ACTIVE' },
              data: { status: 'EXPIRED', expiresAt: now }
            });

            // B. Upsert Suscripción Instructor (Puntero Principal)
            await tx.instructorSubscription.upsert({
              where: { id: metadata.instructorSubscriptionId || 'new-sub' },
              update: {
                status: 'ACTIVE',
                planId: planId,
                stripeSubscriptionId: session.subscription as string,
                stripeCustomerId: session.customer as string,
                startedAt: now,
                expiresAt: thirtyDaysLater
              },
              create: {
                instructorId: profile!.id,
                planId: planId,
                status: 'ACTIVE',
                startedAt: now,
                expiresAt: thirtyDaysLater,
                stripeSubscriptionId: session.subscription as string,
                stripeCustomerId: session.customer as string,
              }
            });

            // C. Crear Registro Histórico
            await tx.subscriptionRecord.create({
              data: {
                userId: userId,
                planId: planId,
                status: 'ACTIVE',
                startDate: now,
                endDate: thirtyDaysLater,
                amountPaid: plan.monthlyPrice,
                stripeSubscriptionId: session.subscription as string,
              }
            });
          });

          const instructorUser = await prisma.user.findUnique({ where: { id: userId } });
          if (instructorUser) {
            // Misión: Flujo de Aprobación
            await prisma.user.update({
              where: { id: userId },
              data: { status: 'PENDING_APPROVAL' }
            });

            // Notificaciones Asíncronas
            const expiresAt = thirtyDaysLater;
            await sendPlanActivityEmail(instructorUser.email, 'WELCOME', plan.name, expiresAt, url);
            await sendSubscriptionNotificationToAdmin(
              instructorUser.name,
              instructorUser.email,
              plan.name,
              Number(plan.monthlyPrice),
              expiresAt,
              url
            );
          }


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

                // Notificar renovación exitosa
                const instructorUser = await prisma.user.findUnique({
                  where: { id: sub.instructorId }
                });
                const plan = await prisma.platformPlan.findUnique({
                  where: { id: sub.planId }
                });
                if (instructorUser && plan) {
                  // Notificaciones Asíncronas
                  const expiresAt = sub.expiresAt || new Date(); // Fallback date for safety
                  await sendPlanActivityEmail(instructorUser.email, 'RENEWAL', plan.name, sub.expiresAt ?? undefined); 
                  await sendSubscriptionNotificationToAdmin(
                    instructorUser.name,
                    instructorUser.email,
                    plan.name,
                    Number(plan.monthlyPrice),
                    expiresAt
                  );
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

      case 'account.updated': {
        const account = event.data.object as any;
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


    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    await sendAdminTechnicalAlert(
      'STRIPE_WEBHOOK_PROCESSING_ERROR',
      `Error procesando evento ${event?.type || 'unknown'}`,
      error.message
    );

    return NextResponse.json({ error: 'Webhook processing failed', details: error.message }, { status: 500 });
  }
}
