import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO MOTOR DE CONCILIACIÓN FINANCIERA ---');
  
  // 1. Obtener todas las suscripciones confirmadas en Mayo
  const subRecords = await prisma.subscriptionRecord.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-05-01')
      }
    },
    include: {
      user: {
        include: {
          instructorProfile: true
        }
      }
    }
  });

  console.log(`Analizando ${subRecords.length} registros de suscripción...`);

  let creadas = 0;

  for (const record of subRecords) {
    // 2. Verificar si ya existe en transactions
    const existingTrans = await prisma.transaction.findFirst({
      where: {
        userId: record.userId,
        paymentType: 'INSTRUCTOR_SUBSCRIPTION',
        grossAmount: record.amountPaid,
        createdAt: {
          gte: new Date(record.createdAt.getTime() - 1000 * 60 * 60), // Margen de 1 hora
          lte: new Date(record.createdAt.getTime() + 1000 * 60 * 60)
        }
      }
    });

    if (!existingTrans) {
      console.log(`[CONCILIACIÓN] Reparando pago de ${record.user.email} ($${record.amountPaid})...`);
      
      // 3. Crear el registro contable faltante
      await prisma.transaction.create({
        data: {
          userId: record.userId,
          instructorId: record.user.instructorProfile?.id || null,
          paymentType: 'INSTRUCTOR_SUBSCRIPTION',
          grossAmount: record.amountPaid,
          platformCommissionAmount: 0,
          netAmountToInstructor: 0,
          currency: 'MXN',
          paymentStatus: 'SUCCESS',
          paymentProvider: 'STRIPE',
          stripePaymentIntentId: record.stripeSubscriptionId, // Usamos el ID de sub como referencia
          createdAt: record.createdAt // Mantener la fecha original del pago
        }
      });
      creadas++;
    }
  }

  console.log(`\n--- CONCILIACIÓN COMPLETADA ---`);
  console.log(`Registros analizados: ${subRecords.length}`);
  console.log(`Registros reparados: ${creadas}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
