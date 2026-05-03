import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const diegoId = '494a100f-c125-4739-afce-a01016bfcf07';
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({ 
    where: { 
      instructorId: diegoId, 
      paymentStatus: 'SUCCESS',
      paymentType: 'COURSE_PURCHASE'
    } 
  });
  
  console.log('Total Successful Sales for Diego (Lifetime):', transactions.length);
  console.dir(transactions.map(x => ({ 
    id: x.id, 
    gross: x.grossAmount.toString(), 
    net: x.netAmountToInstructor.toString(), 
    date: x.createdAt
  })), { depth: null });

  const monthlyTrans = transactions.filter(t => t.createdAt >= startOfMonth);
  console.log('Total Sales this month:', monthlyTrans.length);
  const totalMonthlyGross = monthlyTrans.reduce((acc, curr) => acc + Number(curr.grossAmount), 0);
  console.log('Total Monthly Gross:', totalMonthlyGross);
}
run();
