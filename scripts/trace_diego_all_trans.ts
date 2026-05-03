import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const diegoId = '494a100f-c125-4739-afce-a01016bfcf07';
  const t = await prisma.transaction.findMany({ where: { instructorId: diegoId } });
  console.log('Diego Transactions (Any Type):', t.length);
  console.dir(t.map(x => ({ id: x.id, type: x.paymentType, status: x.paymentStatus, gross: x.grossAmount.toString() })), { depth: null });
}
run();
