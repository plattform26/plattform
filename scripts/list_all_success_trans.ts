import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const transactions = await prisma.transaction.findMany({
    where: { paymentStatus: 'SUCCESS' },
    include: { user: { select: { email: true } } }
  });
  
  console.log('All Success Transactions:');
  console.dir(transactions.map(t => ({ 
    id: t.id, 
    userEmail: t.user.email,
    instructorId: t.instructorId, 
    net: t.netAmountToInstructor.toString(), 
    date: t.createdAt 
  })), { depth: null });
}
run();
