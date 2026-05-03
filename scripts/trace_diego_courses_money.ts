import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const diegoId = 'd5d99c27-b6b6-418d-8b3a-5f586a79ac92';
  const courses = await prisma.course.findMany({ where: { instructorId: diegoId } });
  const ids = courses.map(c => c.id);
  
  const transactions = await prisma.transaction.findMany({ 
    where: { 
      courseId: { in: ids }, 
      paymentStatus: 'SUCCESS' 
    } 
  });
  
  console.log('Transactions for Diego courses:', transactions.length);
  console.dir(transactions.map(x => ({ 
    id: x.id, 
    gross: x.grossAmount.toString(), 
    net: x.netAmountToInstructor.toString(), 
    date: x.createdAt,
    instructorId: x.instructorId
  })), { depth: null });

  const totalNet = transactions.reduce((acc, curr) => acc + Number(curr.netAmountToInstructor), 0);
  console.log('Total Net:', totalNet);
}
run();
