const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const q = await prisma.quiz.findFirst({
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  if (q) {
    console.log('--- VERIFICACIÓN DE DATOS ---');
    console.log(`Quiz: ${q.title}`);
    console.log(`Preguntas: ${q.questions.length}`);
    q.questions.forEach((question, i) => {
      console.log(`  P${i+1}: ${question.questionText}`);
      console.log(`  Opciones: ${question.options.length}`);
      question.options.forEach((opt, j) => {
        console.log(`    - ${opt.optionText} (Correcta: ${opt.isCorrect})`);
      });
    });
  } else {
    console.log('No quizzes found to verify.');
  }
}

verify().catch(console.error).finally(() => prisma.$disconnect());
