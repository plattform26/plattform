import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sub = await prisma.instructorSubscription.findFirst({
    where: { instructor: { user: { email: 'diego.castellanos.maya@hotmail.com' } } }
  });
  console.log('--- SUSCRIPCIÓN COMPLETA ---');
  console.log(JSON.stringify(sub, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
