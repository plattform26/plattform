import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const course = await prisma.course.findUnique({
    where: { id: '8b79eb1c-607e-40fb-886d-318e803d2745' }
  });
  console.log('Course:', JSON.stringify(course, null, 2));
}

check().finally(() => prisma.$disconnect());
