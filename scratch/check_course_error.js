const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const course = await prisma.course.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        visibility: true,
        status: true,
        price: true,
        durationHours: true
      }
    });
    console.log('COURSE_DATA:', JSON.stringify(course, null, 2));
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
