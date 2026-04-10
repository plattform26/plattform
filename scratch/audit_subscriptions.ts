import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- REPORTE DE SINCRONIZACIÓN FINANCIERA ---');

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

  console.log(`Suscripciones activas encontradas: ${activeSubscriptions.length}`);

  let missingCount = 0;
  for (const sub of activeSubscriptions) {
    // 2. Buscar si tiene al menos una transacción exitosa de suscripción
    const tx = await prisma.transaction.findFirst({
      where: {
        userId: sub.instructor.userId,
        paymentType: 'INSTRUCTOR_SUBSCRIPTION',
        paymentStatus: 'SUCCESS'
      }
    });

    if (!tx) {
      missingCount++;
      console.log(`[ALERTA] Instructor ${sub.instructor.user.email} tiene suscripción activa pero NO tiene transacciones en el log.`);
    }
  }

  console.log(`\nTotal de instructores sin registros financieros: ${missingCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
