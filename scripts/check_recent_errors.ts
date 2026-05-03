import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  const alerts = await prisma.systemAlert.findMany({
    where: { createdAt: { gte: tenMinsAgo } },
    orderBy: { createdAt: 'desc' }
  });

  console.log('--- ALERTAS DEL SISTEMA (ÚLTIMOS 10 MIN) ---');
  if (alerts.length > 0) {
    console.table(alerts);
  } else {
    console.log('No hay alertas recientes.');
  }

  // También revisar si el log de evento existe para el ID de Diego
  const eventLog = await prisma.stripeEventLog.findUnique({
    where: { stripeEventId: 'evt_1TSPC2K5P46NFPlsncmI56Vi' }
  });
  console.log(`\n¿Existe el log de evento evt_1TSPC2...?: ${eventLog ? 'SÍ' : 'NO'}`);
  if (eventLog) {
    console.log(`Procesado en: ${eventLog.processedAt}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
