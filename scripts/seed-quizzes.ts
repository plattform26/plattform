import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courseId = 'bebb0c41-7ecd-4ae7-abeb-6f5fbc22929d';
  
  // Hardcoded lesson IDs for the quizzes based on previous DB logs
  const mod1LessonId = '3a72b4e3-1123-4a10-81f0-6c8d08f8179e';
  const mod2LessonId = '8b4e53d7-7832-418e-9015-4d0d7b2eb0f0';

  console.log('Seeding quizzes for course:', courseId);

  async function upsertQuiz(lessonId: string | null, title: string, numQuestions: number) {
    let quiz;
    if (lessonId) {
      quiz = await prisma.quiz.findUnique({ where: { lessonId } });
      if (!quiz) {
        quiz = await prisma.quiz.create({
          data: { courseId, lessonId, title, passingScore: 80, totalScore: 100, scoreDistribution: 'MANUAL' }
        });
      } else {
        quiz = await prisma.quiz.update({
          where: { id: quiz.id },
          data: { passingScore: 80, totalScore: 100, scoreDistribution: 'MANUAL' }
        });
      }
    } else {
      quiz = await prisma.quiz.findFirst({ where: { courseId, lessonId: null } });
      if (!quiz) {
        quiz = await prisma.quiz.create({
          data: { courseId, lessonId: null, title, passingScore: 80, totalScore: 100, scoreDistribution: 'MANUAL' }
        });
      } else {
        quiz = await prisma.quiz.update({
          where: { id: quiz.id },
          data: { passingScore: 80, totalScore: 100, scoreDistribution: 'MANUAL' }
        });
      }
    }

    console.log(`Quiz ${title} (ID: ${quiz.id}) ready. Resetting questions...`);
    
    // Wipe old questions
    await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });

    // Calculate points
    const basePoints = Math.floor(100 / numQuestions);
    const rem = 100 % numQuestions;

    for (let i = 0; i < numQuestions; i++) {
      const isLast = i === numQuestions - 1;
      const points = basePoints + (isLast ? rem : 0);
      
      const optionsJson = [
        { optionText: 'Opción A', isCorrect: true, orderIndex: 1 },
        { optionText: 'Opción B', isCorrect: false, orderIndex: 2 },
        { optionText: 'Opción C', isCorrect: false, orderIndex: 3 }
      ];

      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionText: `Pregunta de prueba ${i + 1} para ${title}`,
          questionType: 'SINGLE',
          points,
          orderIndex: i + 1,
          correctAnswer: JSON.stringify(optionsJson[0]),
          optionsJson,
          options: {
            create: optionsJson
          }
        }
      });
    }
    console.log(`Created ${numQuestions} questions for ${title}.`);
  }

  await upsertQuiz(mod1LessonId, 'Evaluación — Módulo 1: Introducción', 3);
  await upsertQuiz(mod2LessonId, 'Evaluación — Módulo 2', 3);
  await upsertQuiz(null, 'Examen Final del Curso', 5);

  // Update course to have hasQuiz = true
  await prisma.course.update({
    where: { id: courseId },
    data: { hasQuiz: true }
  });

  console.log('Course hasQuiz flag set to true.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
