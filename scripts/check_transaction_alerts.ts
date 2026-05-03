import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITORÍA DE ALERTAS DE TRANSACCIÓN ---');
  
  const alerts = await prisma.systemAlert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  if (alerts.length > 0) {
    console.table(alerts.map(a => ({
      type: a.type,
      message: a.message,
      createdAt: a.createdAt
    })));
  } else {
    console.log('No hay alertas registradas.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
