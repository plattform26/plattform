import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const transactions = await prisma.transaction.findMany({
    where: { paymentStatus: 'SUCCESS' },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  console.log('Recent Successful Transactions:');
  console.dir(transactions.map(t => ({ id: t.id, instructorId: t.instructorId, gross: t.grossAmount, date: t.createdAt })), { depth: null });
}
run();
