import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const course = await prisma.course.findUnique({
    where: { id: '8b79eb1c-0198-49d2-8a27-e7ba7a1d601c' }
  });
  console.log('Course Data:', JSON.stringify(course, null, 2));
}

check().finally(() => prisma.$disconnect());
