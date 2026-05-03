import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- BÚSQUEDA DE DINERO ($199) ---');
  
  const transactions = await prisma.transaction.findMany({
    where: {
      grossAmount: 199,
      createdAt: {
        gte: new Date(new Date().setHours(0,0,0,0)) // Hoy
      }
    },
    include: {
      user: {
        select: { email: true, name: true }
      }
    }
  });

  if (transactions.length > 0) {
    console.log(`Se encontraron ${transactions.length} transacciones de $199 hoy:`);
    console.table(transactions.map(t => ({
      id: t.id,
      email: t.user?.email,
      paymentType: t.paymentType,
      status: t.paymentStatus,
      createdAt: t.createdAt
    })));
  } else {
    console.log('No se encontró NINGUNA transacción de $199 hoy.');
    
    // Ver las últimas 5 transacciones de cualquier monto
    const last5 = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } }
      }
    });
    console.log('\nÚltimas 5 transacciones en el sistema (Cualquier monto):');
    console.table(last5.map(t => ({
      id: t.id,
      email: t.user?.email,
      amount: t.grossAmount.toString(),
      type: t.paymentType,
      createdAt: t.createdAt
    })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
