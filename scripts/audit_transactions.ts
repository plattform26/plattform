import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = '494a100f-c125-4739-afce-a01016bfcf07';

  console.log('--- AUDITORÍA DE TRANSACCIONES (CORREGIDA) ---');

  // 1. Buscar perfil de instructor
  const profile = await prisma.instructorProfile.findUnique({
    where: { userId }
  });

  if (profile) {
    console.log(`\n[TRANSACCIONES DE DIEGO] (Instructor ID: ${profile.id})`);
    const transactions = await prisma.transaction.findMany({
      where: { instructorId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    console.table(transactions.map(t => ({
      id: t.id,
      paymentType: t.paymentType,
      grossAmount: t.grossAmount.toString(),
      paymentStatus: t.paymentStatus,
      createdAt: t.createdAt
    })));
  } else {
    console.log('No se encontró perfil de instructor para Diego.');
  }

  // 2. Conteo por tipo de pago
  console.log('\n[CONTEO POR TIPO DE PAGO]');
  const counts = await prisma.transaction.groupBy({
    by: ['paymentType'],
    _count: { _all: true }
  });
  console.table(counts.map(c => ({
    paymentType: c.paymentType,
    total: c._count._all
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
