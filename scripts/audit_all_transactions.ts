import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({ where: { email: 'azulno26@hotmail.com' } });
  if (!user) {
    console.log('User not found');
    return;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      instructorId: user.id,
      paymentStatus: 'SUCCESS'
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('Total successful transactions:', transactions.length);
  console.dir(transactions.map(t => ({ id: t.id, createdAt: t.createdAt, gross: t.grossAmount })), { depth: null });
}

run();
