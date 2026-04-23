import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, slug: true, status: true, visibility: true }
  });
  console.log('--- COURSES ---');
  console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
