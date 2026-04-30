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
  sendSubscriptionNotificationToAdmin,
  sendInstructorRegistrationNoticeToAdmin
} from '@/lib/mail';
import { Prisma } from '@prisma/client';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;

  // 1. Verificación de Firma (Defensa Perimetral)
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. Check de Idempotencia (Lectura inicial)
  const existingEvent = await prisma.stripeEventLog.findUnique({
    where: { stripeEventId: event.id }
  });

  if (existingEvent) {
    console.log(`ℹ️ Evento ${event.id} ya procesado previamente.`);
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  // 3. Procesamiento de Negocio
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const metadata = session.metadata as any;
        if (!metadata) throw new Error('No metadata found in session');
        
        // ANCLAJE DE DOMINIO: Forzar siempre plattform.mx en producción
        const url = (process.env.NODE_ENV === 'production' ? 'https://www.plattform.mx' : (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001')).replace(/\/$/, '');
        
        let userId = metadata.userId;

        if (!userId) {
          // Fallback para sesiones legacy o de instructor sin userId en metadatos
          const sub = await prisma.instructorSubscription.findUnique({
            where: { id: metadata.instructorSubscriptionId },
            include: { instructor: true }
          });
          if (!sub) throw new Error('Cannot resolve userId: metadata.userId missing and subscription not found');
          userId = sub.instructor.userId;
        }


        // --- CASO 1: COMPRA DE CURSO ---
        if (metadata.transactionType === 'COURSE_PURCHASE') {
          const { courseId, couponCode } = metadata;
          const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { instructor: true }
          });

          if (!course) throw new Error('Course not found');
          const grossAmount = session.amount_total / 100;
          
          const effectivePlan = await getEffectivePlan(course.instructorId);
          const commissionRate = effectivePlan ? Number(effectivePlan.commissionRate) : 15;

          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_intent.latest_charge']
          });
          const pi = expandedSession.payment_intent as any;
          const actualCommission = pi.application_fee_amount ? (pi.application_fee_amount / 100) : 0;
          
          // --- AUDITORÍA DE COMISIÓN: Verificar cobro vs plan del instructor ---
          // 15% Starter, 10% Growth, 7% Scale
          const expectedCommission = (grossAmount * commissionRate) / 100;
          
          if (Math.abs(actualCommission - expectedCommission) > 0.01) {
            await prisma.systemAlert.create({
              data: {
                type: 'COMMISSION_MISMATCH',
                message: `Discrepancia en comisión: Sesión ${session.id}. Esperada: ${expectedCommission} (${commissionRate}%), Cobrada: ${actualCommission}. Instructor ID: ${course.instructorId}`
              }
            });
          }

          const platformCommission = actualCommission || (grossAmount * commissionRate) / 100;
            
          const netAmount = grossAmount - platformCommission;
          const charge = pi?.latest_charge as any;
          const stripeTransferId = charge?.transfer as string;

          await prisma.$transaction(async (tx) => {
            await tx.enrollment.upsert({
              where: { userId_courseId: { userId, courseId } },
              update: { status: 'ACTIVE' },
              create: { userId, courseId, accessType: 'PURCHASE', status: 'ACTIVE' }
            });

            // Blindaje P2002: Evitar duplicidad de transacciones (Defensa en profundidad)
            try {
              await tx.transaction.create({
                data: {
                  userId, courseId, instructorId: course.instructorId,
                  paymentType: 'COURSE_PURCHASE', grossAmount,
                  platformCommissionAmount: platformCommission, platformCommissionRate: commissionRate,
                  netAmountToInstructor: netAmount, paymentStatus: 'SUCCESS',
                  stripeSessionId: session.id, stripePaymentIntentId: session.payment_intent as string,
                  stripeTransferId: stripeTransferId || null,
                }
              });
            } catch (err: any) {
              if (err.code === 'P2002') console.log(`ℹ️ Transacción ${session.id} ya existía, saltando.`);
              else throw err;
            }

            await tx.notification.create({
              data: {
                userId: course.instructorId, type: 'COURSE_PURCHASED',
                title: '🎉 Nuevo alumno inscrito',
                message: `Un nuevo alumno ha comprado tu curso: ${course.title}.`,
                relatedEntityType: 'COURSE', relatedEntityId: course.id
              }
            });

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
              const coupon = await tx.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
              if (coupon) {
                // Blindaje P2002: Un alumno, un cupón
                try {
                  await tx.couponUsage.create({ data: { userId, couponId: coupon.id } });
                } catch (err: any) {
                  if (err.code === 'P2002') console.log(`ℹ️ Cupón ya aplicado por el usuario.`);
                  else throw err;
                }
                (session as any)._discountInfo = { code: coupon.code, percent: coupon.discountPercent };
              }
            }
          });

          const userRecord = await prisma.user.findUnique({ where: { id: userId } });
          const instructorUser = await prisma.user.findUnique({ where: { id: course.instructorId } });
          const discountInfo = (session as any)._discountInfo;

          // 5. Enviar Correos (Blindados e Independientes)
          if (userRecord) {
            try {
              await sendPaymentConfirmationEmail(userRecord.email, userRecord.name, course.title, grossAmount, discountInfo, url);
            } catch (err: any) {
              await prisma.systemAlert.create({ data: { type: 'EMAIL_STUDENT_FAIL', message: `Error enviando correo a alumno (${userRecord.email}): ${err.message}` } });
            }
          }

          if (instructorUser) {
            try {
              await sendSaleNotificationToInstructor(instructorUser.email, userRecord?.name || 'Un alumno', course.title, url);
            } catch (err: any) {
              await prisma.systemAlert.create({ data: { type: 'EMAIL_INSTRUCTOR_FAIL', message: `Error enviando correo a instructor (${instructorUser.email}): ${err.message}` } });
            }
          }

          try {
            await sendSaleNotificationToAdmin(userRecord?.name || 'Un alumno', course.title, grossAmount, discountInfo, url);
          } catch (err: any) {
            await prisma.systemAlert.create({ data: { type: 'EMAIL_ADMIN_FAIL', message: `Error enviando correo a admin: ${err.message}` } });
          }
        }

        // --- CASO 2: SUSCRIPCIÓN DE INSTRUCTOR ---
        if (metadata.transactionType === 'INSTRUCTOR_SUBSCRIPTION') {
          const { planId } = metadata;
          const plan = await prisma.platformPlan.findUnique({ where: { id: planId } });
          if (!plan) throw new Error('Plan not found');

          let profile = await prisma.instructorProfile.findUnique({ where: { userId } });
          if (!profile) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error('User not found');
            const slugBase = user.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
            profile = await prisma.instructorProfile.create({
              data: { userId: user.id, academyName: `${user.name} Academy`, slug: `${slugBase}-${user.id.substring(0, 5)}`, commissionRate: plan.commissionRate }
            });
          }

          const now = new Date();
          let expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default +30 días
          if (session.subscription) {
            const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as any;
            const periodEnd = stripeSub.current_period_end ?? stripeSub.items?.data?.[0]?.current_period_end;
            const calculatedDate = periodEnd ? new Date(periodEnd * 1000) : null;
            
            expiresAt = (calculatedDate && !isNaN(calculatedDate.getTime()))
              ? calculatedDate
              : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Fallback seguro
          }

          await prisma.$transaction(async (tx) => {
            // 1. Validación y Fallback de ID de Suscripción (Soporte para sesiones legacy)
            if (!metadata.instructorSubscriptionId) {
              const activeSub = await tx.instructorSubscription.findFirst({
                where: { instructorId: profile!.id, status: 'ACTIVE' }
              });
              if (!activeSub) {
                throw new Error('Missing instructorSubscriptionId in metadata and no active subscription found');
              }
              metadata.instructorSubscriptionId = activeSub.id;
            }

            // 2. SEGURIDAD: Expiramos cualquier OTRA suscripción activa, pero NO la que estamos procesando.
            await tx.instructorSubscription.updateMany({ 
              where: { 
                instructorId: profile!.id, 
                status: 'ACTIVE',
                NOT: { id: metadata.instructorSubscriptionId as string } 
              }, 
              data: { status: 'EXPIRED', expiresAt: now } 
            });

            await tx.instructorSubscription.upsert({
              where: { id: metadata.instructorSubscriptionId },
              update: { status: 'ACTIVE', planId, stripeSubscriptionId: session.subscription as string, stripeCustomerId: session.customer as string, startedAt: now, expiresAt },
              create: { instructorId: profile!.id, planId, status: 'ACTIVE', startedAt: now, expiresAt, stripeSubscriptionId: session.subscription as string, stripeCustomerId: session.customer as string }
            });
            await tx.subscriptionRecord.create({ data: { userId, planId, status: 'ACTIVE', startDate: now, endDate: expiresAt, amountPaid: plan.monthlyPrice, stripeSubscriptionId: session.subscription as string } });
          });

          const instructorUser = await prisma.user.findUnique({ where: { id: userId } });
          if (instructorUser) {
            const newStatus = instructorUser.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_APPROVAL';
            await prisma.user.update({ where: { id: userId }, data: { status: newStatus } });
            await sendPlanActivityEmail(instructorUser.email, 'WELCOME', plan.name, expiresAt, url);
            if (newStatus === 'PENDING_APPROVAL') await sendInstructorRegistrationNoticeToAdmin(instructorUser.name, userId, url);
            await sendSubscriptionNotificationToAdmin(instructorUser.name, instructorUser.email, plan.name, Number(plan.monthlyPrice), expiresAt, url);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const updatedSubs = await prisma.instructorSubscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription },
            data: { status: 'ACTIVE' }
          });

          if (updatedSubs.count > 0) {
            const sub = await prisma.instructorSubscription.findFirst({ where: { stripeSubscriptionId: invoice.subscription } });
            if (sub) {
              const profile = await prisma.instructorProfile.findUnique({ where: { id: sub.instructorId } });
              if (profile) {
                await prisma.course.updateMany({
                  where: { instructorId: profile.userId, status: 'HIBERNATED' },
                  data: { status: 'PUBLISHED' }
                });
              }
              const instructorUser = await prisma.user.findUnique({ where: { id: sub.instructorId } });
              const plan = await prisma.platformPlan.findUnique({ where: { id: sub.planId } });
              if (instructorUser && plan) {
                await sendPlanActivityEmail(instructorUser.email, 'RENEWAL', plan.name, sub.expiresAt ?? undefined); 
                await sendSubscriptionNotificationToAdmin(instructorUser.name, instructorUser.email, plan.name, Number(plan.monthlyPrice), sub.expiresAt || new Date());
              }
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await prisma.instructorSubscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription },
            data: { status: 'PAST_DUE' }
          });
          const sub = await prisma.instructorSubscription.findFirst({ where: { stripeSubscriptionId: invoice.subscription } });
          if (sub) {
            await prisma.notification.create({
              data: { userId: sub.instructorId, type: 'SYSTEM_ALERT', title: '⚠️ Error en el pago', message: 'No pudimos procesar el cargo de tu plan.' }
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as any;
        const sub = await prisma.instructorSubscription.findFirst({ where: { stripeSubscriptionId: stripeSub.id }, include: { plan: true } });
        if (sub) {
          const totalEnrollments = await prisma.enrollment.count({ where: { course: { instructorId: sub.instructorId } } });
          if (sub.plan.studentLimit !== -1 && totalEnrollments > sub.plan.studentLimit) {
            await prisma.course.updateMany({ where: { instructorId: sub.instructorId }, data: { status: 'HIBERNATED' } });
            await prisma.notification.create({
              data: { userId: sub.instructorId, type: 'SYSTEM_ALERT', title: '⚠️ Cursos Hibernados', message: 'Has excedido el límite de tu plan.' }
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as any;
        const sub = await prisma.instructorSubscription.findFirst({ where: { stripeSubscriptionId: stripeSub.id } });
        if (sub) {
          await prisma.$transaction(async (tx) => {
            await tx.instructorSubscription.update({ where: { id: sub.id }, data: { status: 'CANCELLED' } });
            const profile = await tx.instructorProfile.findUnique({ where: { id: sub.instructorId } });
            if (profile) {
              await tx.course.updateMany({ where: { instructorId: profile.userId }, data: { status: 'HIBERNATED' } });
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
            await prisma.instructorProfile.update({ where: { userId }, data: { stripeOnboardingComplete: true } });
          }
        }
        break;
      }
    }

    // 4. ÉXITO: Marcar evento como procesado al final
    await prisma.stripeEventLog.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type
      }
    });

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook processing failed, Stripe will retry:', error);
    await sendAdminTechnicalAlert('STRIPE_WEBHOOK_PROCESSING_ERROR', `Error procesando evento ${event.type}`, error.message);
    // IMPORTANTE: Al no crear el registro en StripeEventLog, Stripe reintentará y procesará de nuevo.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
