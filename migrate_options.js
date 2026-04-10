const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedQuizOptions() {
  console.log('Syncing QuizOptions for existing questions...');
  const questions = await prisma.quizQuestion.findMany({
    include: { options: true }
  });

  for (const q of questions) {
    if (q.options.length === 0 && q.optionsJson) {
      console.log(`Migrating options for question: ${q.id}`);
      const options = Array.isArray(q.optionsJson) ? q.optionsJson : JSON.parse(q.optionsJson);
      const answers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer].filter(Boolean);

      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await prisma.quizOption.create({
          data: {
            questionId: q.id,
            optionText: typeof opt === 'string' ? opt : (opt.text || opt.optionText),
            isCorrect: Array.isArray(answers) ? answers.includes(typeof opt === 'string' ? opt : (opt.id || opt.optionText)) : (answers === (typeof opt === 'string' ? opt : (opt.id || opt.optionText))),
            orderIndex: i + 1
          }
        });
      }
    }
  }
  console.log('Migration complete.');
}

seedQuizOptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
