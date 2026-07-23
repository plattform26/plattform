const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const profile = await prisma.instructorProfile.findUnique({
    where: { slug: 'tabata-bbaf5' }
  });
  const courses = await prisma.course.findMany({
    where: {
      instructorId: profile.userId,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      deletedAt: null
    }
  });
  console.log('VERIFICATION -> COURSES COUNT:', courses.length);
  console.log('VERIFICATION -> COURSE TITLE:', courses[0]?.title);
  console.log('VERIFICATION -> VISIBILITY:', courses[0]?.visibility);
}

verify().catch(console.error).finally(() => prisma.$disconnect());
