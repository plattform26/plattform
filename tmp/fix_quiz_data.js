const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const q1_correct_id = '6c7f2a18-cf35-4420-8cab-49ddd750ec2c'; // "cruz azul"
  const q2_correct_id = '35b53d3d-e333-4da1-9430-782293126c63'; // "2"

  console.log('--- FIXING QUIZ DATA ---');

  // Reset all for those questions first (to be clean)
  await prisma.quizOption.updateMany({
    where: { questionId: { in: ['ef138e26-5c07-4f3d-868b-5b3763d00497', 'f7470f1a-6379-4458-9477-96a84f37803d'] } },
    data: { isCorrect: false }
  });

  // Set correct ones
  const q1 = await prisma.quizOption.update({
    where: { id: q1_correct_id },
    data: { isCorrect: true }
  });
  console.log(`- Q1 Correct Set: ${q1.optionText}`);

  const q2 = await prisma.quizOption.update({
    where: { id: q2_correct_id },
    data: { isCorrect: true }
  });
  console.log(`- Q2 Correct Set: ${q2.optionText}`);

  console.log('--- DONE ---');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
