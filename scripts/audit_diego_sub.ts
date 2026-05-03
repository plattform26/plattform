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
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  console.log('--- ESTADO DE SUSCRIPCIÓN EN BD ---');
  console.log(JSON.stringify({
    userId: user.id,
    email: user.email,
    subscription: sub
  }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
