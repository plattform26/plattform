import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUserAudit() {
  const userId = '05D3B02F-8E8B-41BD-8B3A-3F386A79AC92';
  console.log(`Checking audit for user: ${userId}`);
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  console.log('User found:', user?.email, user?.role);
  
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: true }
  });
  console.log('Enrollments found:', enrollments.length);
  enrollments.forEach(en => {
    console.log(`- Course: ${en.course.title} (ID: ${en.courseId})`);
  });

  const createdCourses = await prisma.course.findMany({
    where: { instructorId: userId }
  });
  console.log('Created Courses found:', createdCourses.length);
}

checkUserAudit()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
