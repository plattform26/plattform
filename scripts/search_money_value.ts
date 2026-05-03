import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const transactions = await prisma.transaction.findMany({
    where: { paymentStatus: 'SUCCESS' }
  });
  
  let match = false;
  for (const t of transactions) {
    const gross = Number(t.grossAmount);
    const net = Number(t.netAmountToInstructor);
    if (gross === 424.74 || net === 424.74) {
      console.log('MATCH FOUND!');
      console.dir(t, { depth: null });
      match = true;
    }
  }
  
  if (!match) {
    console.log('No exact match for 424.74 found.');
    // Maybe sum?
    const sumNet = transactions.reduce((acc, curr) => acc + Number(curr.netAmountToInstructor), 0);
    console.log('Total Net for all transactions:', sumNet);
  }
}
run();
