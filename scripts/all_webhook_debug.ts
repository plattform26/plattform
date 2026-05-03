import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const alerts = await prisma.systemAlert.findMany({
    where: { type: 'WEBHOOK_DEBUG' },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  console.log('--- TODOS LOS LOGS DE DEPURACIÓN ---');
  console.table(alerts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
