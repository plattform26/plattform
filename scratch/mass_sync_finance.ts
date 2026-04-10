import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO SINCRONIZACIÓN UNIVERSAL DE FINANZAS ---');

  // 1. Obtener todas las suscripciones de instructores activas
  const subscriptions = await prisma.instructorSubscription.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      instructor: {
        include: { user: true }
      },
      plan: true
    }
  });

  console.log(`Detectadas ${subscriptions.length} suscripciones activas.`);

  for (const sub of subscriptions) {
    const userId = sub.instructor.userId;
    const planName = sub.plan.displayName;
    const amount = sub.plan.monthlyPrice;

    // 2. Verificar si ya existe una transacción exitosa para esta suscripción
    // Usamos el ID de la subscripción o simplemente el tipo y usuario como criterio de existencia base
    const existingTx = await prisma.transaction.findFirst({
      where: {
        userId,
        paymentType: 'INSTRUCTOR_SUBSCRIPTION',
        paymentStatus: 'SUCCESS'
      }
    });

    if (!existingTx) {
      console.log(`> Sincronizando: ${sub.instructor.user.email} (${planName}) -> $${amount}`);
      
      await prisma.transaction.create({
        data: {
          userId,
          paymentType: 'INSTRUCTOR_SUBSCRIPTION',
          grossAmount: Number(amount),
          platformCommissionAmount: 0,
          netAmountToInstructor: 0,
          paymentStatus: 'SUCCESS',
          paymentProvider: 'STRIPE',
          stripePaymentIntentId: 'pi_manual_sync_' + Math.random().toString(36).substring(7),
          createdAt: sub.startedAt || new Date(),
          updatedAt: new Date()
        }
      });
    } else {
      console.log(`- ${sub.instructor.user.email} ya tiene registros de pago. Omitiendo.`);
    }
  }

  console.log('--- SINCRONIZACIÓN COMPLETADA ---');
}

main()
  .catch(e => {
    console.error('Error durante la sincronización:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
