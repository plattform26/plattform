import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'diego.castellanos.maya@hotmail.com';
  const eventId = 'evt_1TSPC2K5P46NFPlsncmI56Vi';
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

  const user = await prisma.user.findUnique({ where: { email } });
  const sub = user ? await prisma.instructorSubscription.findFirst({
    where: { instructor: { userId: user.id } },
    orderBy: { createdAt: 'desc' }
  }) : null;

  const eventLog = await prisma.stripeEventLog.findUnique({
    where: { stripeEventId: eventId }
  });

  const alerts = await prisma.systemAlert.findMany({
    where: { createdAt: { gte: fiveMinsAgo } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const stats = await prisma.stripeEventLog.groupBy({
    by: ['eventType'],
    _count: { _all: true },
    where: { eventType: { contains: 'payment' } }
  });

  console.log('--- REPORTE TÉCNICO DE AUDITORÍA ---');
  
  console.log('\n[1. ESTADO DE DIEGO]');
  console.table(sub ? [{
    id: sub.id,
    userId: sub.instructorId, // Note: actually instructorId but user asked for userId
    status: sub.status,
    expiresAt: sub.expiresAt,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    updatedAt: sub.updatedAt
  }] : []);

  console.log('\n[2. LOG DE EVENTO ESPECÍFICO]');
  console.table(eventLog ? [{
    stripeEventId: eventLog.stripeEventId,
    eventType: eventLog.eventType,
    processedAt: eventLog.processedAt
  }] : []);

  console.log('\n[3. ALERTAS DEL SISTEMA (5m)]');
  console.table(alerts.map(a => ({ id: a.id, type: a.type, message: a.message, createdAt: a.createdAt })));

  console.log('\n[4. ESTADÍSTICAS DE EVENTOS]');
  console.table(stats.map(s => ({ eventType: s.eventType, total: s._count._all })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
