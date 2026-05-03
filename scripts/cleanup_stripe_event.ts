import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const eventId = 'evt_1TSPC2K5P46NFPlsncmI56Vi';
  
  const deleted = await prisma.stripeEventLog.deleteMany({
    where: { stripeEventId: eventId }
  });

  console.log(`--- LIMPIEZA DE EVENTOS ---`);
  console.log(`Eventos eliminados: ${deleted.count}`);

  const check = await prisma.stripeEventLog.count({
    where: { stripeEventId: eventId }
  });
  console.log(`Conteo actual para ${eventId}: ${check}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
