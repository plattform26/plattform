import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: '494a100f-c125-4739-afce-a01016bfcf07' },
    include: { subscriptions: true }
  });
  console.log('--- PERFIL Y SUSCRIPCIONES ---');
  console.log(JSON.stringify(profile, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
