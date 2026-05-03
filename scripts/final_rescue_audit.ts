import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'diego.castellanos.maya@hotmail.com';
  const eventId = 'evt_1TSPC2K5P46NFPlsncmI56Vi';
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);

  const user = await prisma.user.findUnique({ where: { email } });
  const sub = user ? await prisma.instructorSubscription.findFirst({
    where: { instructor: { userId: user.id } },
    orderBy: { createdAt: 'desc' }
  }) : null;

  const eventLog = await prisma.stripeEventLog.findUnique({
    where: { stripeEventId: eventId }
  });

  const alerts = await prisma.systemAlert.findMany({
    where: { createdAt: { gte: twoMinsAgo } },
    orderBy: { createdAt: 'desc' }
  });

  console.log('--- AUDITORÍA FINAL POST-RESCATE ---');
  console.log('\n[USUARIO]');
  console.table(user ? [{ id: user.id, status: user.status }] : []);

  console.log('\n[SUSCRIPCIÓN]');
  console.table(sub ? [{
    status: sub.status,
    expiresAt: sub.expiresAt,
    stripeSubscriptionId: sub.stripeSubscriptionId
  }] : []);

  console.log('\n[LOG DE EVENTO]');
  console.table(eventLog ? [eventLog] : []);

  console.log('\n[ALERTAS RECIENTES]');
  console.table(alerts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
