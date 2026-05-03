import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'diego.castellanos.maya@hotmail.com' }
  });

  if (!user) {
    console.log('Usuario no encontrado.');
    return;
  }

  const sub = await prisma.instructorSubscription.findFirst({
    where: { instructor: { userId: user.id } },
    orderBy: { createdAt: 'desc' }
  });

  console.log('--- REPORTE DE SUSCRIPCIÓN (SQL MOCK) ---');
  console.table(sub ? [{
    id: sub.id,
    userId: user.id,
    planId: sub.planId,
    status: sub.status,
    createdAt: sub.createdAt,
    expiresAt: sub.expiresAt,
    stripeSubscriptionId: sub.stripeSubscriptionId
  }] : []);
}

main().catch(console.error).finally(() => prisma.$disconnect());
