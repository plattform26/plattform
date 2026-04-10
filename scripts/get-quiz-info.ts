import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const quiz = await prisma.quiz.findFirst({
    where: { id: { startsWith: '9d64fc58' } },
    include: { lesson: true }
  });
  console.log(JSON.stringify(quiz, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
