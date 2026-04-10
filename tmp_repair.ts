import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function heal() {
  const courseId = '24266a18-170c-4492-8bf0-d5a7733e7da5';
  console.log('Healing course:', courseId);

  const questions = await prisma.quizQuestion.findMany({
    where: { 
      quiz: { courseId } 
    },
    include: { options: true }
  });

  console.log(`Found ${questions.length} questions.`);

  for (const q of questions) {
    const rawCorrect = q.correctAnswer;
    const correctIndexes: number[] = Array.isArray(rawCorrect) 
      ? rawCorrect.map((i: any) => parseInt(i)) 
      : [parseInt(rawCorrect as string)];

    console.log(`Question: "${q.questionText}" | Correct Indexes:`, correctIndexes);

    for (const idx of correctIndexes) {
      const targetOrder = idx + 1; // logical mapping [0] -> orderIndex 1
      const targetOpt = q.options.find(o => o.orderIndex === targetOrder);

      if (targetOpt) {
        await prisma.quizOption.update({
          where: { id: targetOpt.id },
          data: { isCorrect: true }
        });
        console.log(`  -> SET CORRECT: "${targetOpt.optionText}" (ID: ${targetOpt.id})`);
      } else {
        console.warn(`  !! Could not find option for index ${idx} (Target orderIndex: ${targetOrder})`);
      }
    }
  }
}

heal()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
