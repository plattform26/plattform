import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({ where: { email: 'azulno26@hotmail.com' } });
  if (!user) {
    console.log('User not found');
    return;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const enrollmentsCount = await prisma.enrollment.count({
    where: {
      course: { instructorId: user.id },
      createdAt: { gte: startOfMonth }
    }
  });

  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: { instructorId: user.id },
      createdAt: { gte: startOfMonth }
    },
    include: { course: true }
  });

  const transactions = await prisma.transaction.aggregate({
    where: {
      instructorId: user.id,
      paymentStatus: 'SUCCESS',
      createdAt: { gte: startOfMonth }
    },
    _sum: { grossAmount: true }
  });

  console.log('Enrollments this month:', enrollmentsCount);
  console.log('Enrollments details:', JSON.stringify(enrollments.map(e => ({ id: e.id, createdAt: e.createdAt, coursePrice: e.course.price })), null, 2));
  console.log('Monthly transactions (gross):', transactions._sum.grossAmount);
}

run();
