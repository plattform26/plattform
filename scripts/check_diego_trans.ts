import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = '494a100f-c125-4739-afce-a01016bfcf07';
  
  const trans = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  if (trans) {
    console.log('--- TRANSACCIÓN ENCONTRADA ---');
    console.log(`ID: ${trans.id}`);
    console.log(`Tipo: ${trans.paymentType}`);
    console.log(`Monto: ${trans.grossAmount}`);
    console.log(`Status: ${trans.paymentStatus}`);
    console.log(`Fecha: ${trans.createdAt}`);
  } else {
    console.log('No se encontró ninguna transacción para este usuario.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
