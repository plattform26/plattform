import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDiegoEnrollments() {
  const userId = 'd5d99c27-b6b6-418d-8b3a-5f586a79ac92';
  console.log(`Checking enrollments for: ${userId}`);
  
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: true }
  });
  
  console.log(`Found ${enrollments.length} enrollments.`);
  enrollments.forEach(en => {
    console.log(`- ${en.course.title}`);
  });
}

checkDiegoEnrollments()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
