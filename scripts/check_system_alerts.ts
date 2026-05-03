import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const alerts = await prisma.systemAlert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  console.log('--- ÚLTIMAS ALERTAS DEL SISTEMA ---');
  console.table(alerts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
