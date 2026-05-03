import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.stripeEventLog.findMany({
    orderBy: { processedAt: 'desc' },
    take: 20
  });
  console.log('--- EVENTOS DE STRIPE PROCESADOS ---');
  console.table(events);
}

main().catch(console.error).finally(() => prisma.$disconnect());
