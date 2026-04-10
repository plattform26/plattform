const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const quiz = await prisma.quiz.findFirst({
    where: {
      title: {
        contains: 'Cruz Azul',
        mode: 'insensitive'
      }
    },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  if (!quiz) {
    console.log('Quiz "Cruz Azul" not found');
    return;
  }

  console.log(`Quiz Found: ${quiz.title} (ID: ${quiz.id})`);
  quiz.questions.forEach((q, i) => {
    console.log(`\nQuestion ${i + 1}: ${q.questionText}`);
    const correctOptions = q.options.filter(o => o.isCorrect);
    console.log(`Options: ${q.options.length}`);
    q.options.forEach(o => {
      console.log(` - [${o.isCorrect ? 'X' : ' '}] ID: ${o.id} - Text: ${o.optionText}`);
    });
    if (correctOptions.length === 0) {
      console.warn('WARNING: No correct option marked for this question!');
    }
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
