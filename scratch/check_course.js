const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourse() {
  const course = await prisma.course.findUnique({
    where: { id: '05392716-c4ab-4a70-951f-3d8c903b1425' },
    select: {
      id: true,
      title: true,
      status: true,
      visibility: true,
      deletedAt: true,
      instructorId: true
    }
  });
  console.log('COURSE_DETAILS:', JSON.stringify(course, null, 2));
}

checkCourse().catch(console.error).finally(() => prisma.$disconnect());
