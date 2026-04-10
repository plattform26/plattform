import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO SINCRONIZACIÓN MASIVA DE RENTAS ---');

  // 1. Obtener todas las suscripciones activas
  const activeSubscriptions = await prisma.instructorSubscription.findMany({
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

  console.log(`Detectadas ${activeSubscriptions.length} suscripciones activas.`);

  for (const sub of activeSubscriptions) {
    const userId = sub.instructor.userId;
    const planName = sub.plan.displayName;
    const planPrice = sub.plan.monthlyPrice;

    // 2. Verificar si ya existe una transacción de este tipo para este usuario
    // (Para esta corrección masiva, buscamos si tiene AL MENOS una transacción de renta exitosa)
    const existingTx = await prisma.transaction.findFirst({
      where: {
        userId,
        paymentType: 'INSTRUCTOR_SUBSCRIPTION',
        paymentStatus: 'SUCCESS'
      }
    });

    if (!existingTx) {
      console.log(`> Sincronizando renta para: ${sub.instructor.user.email} (${planName})...`);
      
      // Creamos la transacción usando la fecha de inicio de la suscripción
      await prisma.transaction.create({
        data: {
          userId,
          paymentType: 'INSTRUCTOR_SUBSCRIPTION',
          grossAmount: planPrice,
          platformCommissionAmount: 0,
          netAmountToInstructor: 0,
          paymentStatus: 'SUCCESS',
          paymentProvider: 'STRIPE',
          stripePaymentIntentId: 'pi_sync_' + Math.random().toString(36).substring(7),
          createdAt: sub.startedAt,
          updatedAt: sub.updatedAt
        }
      });
    } else {
      console.log(`- Instructor ${sub.instructor.user.email} ya tiene registros financieros. Omitiendo.`);
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
