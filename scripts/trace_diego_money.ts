import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const t = await prisma.transaction.findMany({
    where: { instructorId: 'd5d99c27-b6b6-418d-8b3a-5f586a79ac92' },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Diego Transactions:');
  console.dir(t.map(x => ({ id: x.id, gross: x.grossAmount.toString(), net: x.netAmountToInstructor.toString(), status: x.paymentStatus, date: x.createdAt })), { depth: null });
}
run();
