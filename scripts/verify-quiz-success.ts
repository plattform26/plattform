import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const quizIdPrefix = '9d64fc58';
  const quiz = await prisma.quiz.findFirst({
    where: { id: { startsWith: quizIdPrefix } },
    include: { questions: { include: { options: true } } }
  });

  if (!quiz) {
    console.error('Quiz not found');
    return;
  }

  console.log(`Testing Quiz: ${quiz.title}`);
  
  // Simulate selecting all correct answers
  const selectedAnswers: Record<string, string> = {};
  for (const q of quiz.questions) {
    const correctOpt = q.options.find(opt => opt.isCorrect);
    if (correctOpt) {
      selectedAnswers[q.id] = correctOpt.id;
      console.log(`- Question: ${q.questionText} -> Selected CORRECT: ${correctOpt.optionText}`);
    } else {
      console.warn(`- Question: ${q.questionText} has NO correct option!`);
    }
  }

  // Scoring Logic (same as in route.ts)
  let correctCount = 0;
  for (const q of quiz.questions) {
    const userAnswerId = selectedAnswers[q.id];
    if (userAnswerId) {
      const acierto = await prisma.quizOption.findFirst({
        where: { id: userAnswerId, questionId: q.id, isCorrect: true }
      });
      if (acierto) {
        correctCount++;
      }
    }
  }

  const scorePercentage = (correctCount / quiz.questions.length) * 100;
  console.log(`Final Result: ${correctCount}/${quiz.questions.length} (${scorePercentage}%)`);

  if (scorePercentage === 100) {
    console.log('SUCCESS: Quiz can be passed with 100%!');
  } else {
    console.error('FAILURE: Quiz cannot be passed with 100% using isCorrect flag!');
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
