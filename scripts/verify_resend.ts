import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'diego.castellanos.maya@hotmail.com';
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

  const sub = await prisma.instructorSubscription.findFirst({
    where: { instructor: { user: { email } } },
    orderBy: { createdAt: 'desc' }
  });

  const events = await prisma.stripeEventLog.findMany({
    where: { processedAt: { gte: fiveMinsAgo } },
    orderBy: { processedAt: 'desc' },
    take: 5
  });

  const alerts = await prisma.systemAlert.findMany({
    where: { createdAt: { gte: fiveMinsAgo } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('--- VERIFICACIÓN POST-REENVÍO ---');
  console.log('\n[SUSCRIPCIÓN]');
  console.table(sub ? [{
    status: sub.status,
    expiresAt: sub.expiresAt,
    stripeSubscriptionId: sub.stripeSubscriptionId
  }] : []);

  console.log('\n[EVENTOS RECIENTES (Stripe)]');
  console.table(events);

  console.log('\n[ALERTAS RECIENTES (SystemAlert)]');
  console.table(alerts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
