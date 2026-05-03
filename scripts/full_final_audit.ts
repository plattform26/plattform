import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'diego.castellanos.maya@hotmail.com';
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('Usuario no encontrado.');
    return;
  }

  const profile = await prisma.instructorProfile.findUnique({ where: { userId: user.id } });
  const sub = await prisma.instructorSubscription.findFirst({
    where: { instructor: { userId: user.id } },
    orderBy: { createdAt: 'desc' }
  });

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const events = await prisma.stripeEventLog.findMany({
    where: { processedAt: { gte: oneHourAgo } },
    orderBy: { processedAt: 'desc' },
    take: 10
  });

  console.log('--- REPORTE FINAL DE AUDITORÍA ---');
  console.log('\n[USUARIO]');
  console.table([{ id: user.id, email: user.email, status: user.status }]);

  console.log('\n[PERFIL INSTRUCTOR]');
  console.table(profile ? [{ id: profile.id, userId: profile.userId }] : []);

  console.log('\n[SUSCRIPCIÓN]');
  console.table(sub ? [{
    id: sub.id,
    status: sub.status,
    expiresAt: sub.expiresAt,
    stripeSubscriptionId: sub.stripeSubscriptionId
  }] : []);

  console.log('\n[EVENTOS STRIPE (Última hora)]');
  console.table(events);
}

main().catch(console.error).finally(() => prisma.$disconnect());
