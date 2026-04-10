import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const quizIdPrefix = '9d64fc58';
  
  // Buscar el quiz completo por prefijo porque el usuario dio solo el inicio
  const quiz = await prisma.quiz.findFirst({
    where: { 
      id: { startsWith: quizIdPrefix }
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
    console.error('No se encontró el quiz con prefijo:', quizIdPrefix);
    return;
  }

  console.log('Quiz encontrado:', quiz.title, 'ID:', quiz.id);

  for (const question of quiz.questions) {
    for (const option of question.options) {
      const text = option.optionText.toLowerCase();
      // "cruz azul" o "2" deben ser correctas según el usuario
      if (text.includes('cruz azul') || text === '2') {
        await prisma.quizOption.update({
          where: { id: option.id },
          data: { isCorrect: true }
        });
        console.log(`Updated option to CORRECT: "${option.optionText}" (ID: ${option.id})`);
      } else {
        // Asegurarse de que las demás NO sean correctas si no coinciden
        await prisma.quizOption.update({
          where: { id: option.id },
          data: { isCorrect: false }
        });
        console.log(`Updated option to INCORRECT: "${option.optionText}" (ID: ${option.id})`);
      }
    }
  }

  console.log('Data fix completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
