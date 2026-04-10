import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
  console.log('--- BUSCANDO EXAMEN CRUZ AZUL ---');
  // 9d64fc58-e7e0-4780-9280-9e9095696d74 es el Course ID
  const course = await prisma.course.findUnique({
    where: { id: '9d64fc58-e7e0-4780-9280-9e9095696d74' },
    include: { 
      quizzes: {
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    console.log('Curso no encontrado');
    return;
  }

  console.log(`Curso: ${course.title}`);
  for (const quiz of course.quizzes) {
    console.log(`\nQuiz: ${quiz.title} (${quiz.id})`);
    console.log(`Preguntas vinculadas: ${quiz.questions.length}`);
    for (const q of quiz.questions) {
      console.log(`  - P: ${q.questionText}`);
      console.log(`    Opciones en tabla QuizOption: ${q.options.length}`);
      q.options.forEach(o => {
        console.log(`      * ${o.isCorrect ? '[X]' : '[ ]'} ${o.optionText} (ID: ${o.id})`);
      });
      if (q.options.length === 0) {
        console.log(`    ⚠️ ADVERTENCIA: Esta pregunta no tiene opciones vinculadas en la tabla QuizOption.`);
      }
    }
  }
}

checkData()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
