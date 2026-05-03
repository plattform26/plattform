import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({
    where: { id: 'bf978c06-707d-4e50-936d-a9486a295af9' }
  });
  console.log('--- CURSO ENCONTRADO ---');
  console.log(JSON.stringify(course, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
