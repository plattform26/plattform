const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixVisibility() {
  const updatedCourse = await prisma.course.update({
    where: { id: '05392716-c4ab-4a70-951f-3d8c903b1425' },
    data: { visibility: 'PUBLIC' }
  });
  console.log('UPDATED_COURSE:', JSON.stringify(updatedCourse, null, 2));
}

fixVisibility().catch(console.error).finally(() => prisma.$disconnect());
