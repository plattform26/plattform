const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFinalQuizSync() {
  console.log('--- TESTING FINAL QUIZ ATOMIC SYNC ---');

  const course = await prisma.course.findFirst({
    where: { title: { contains: 'Claude AI', mode: 'insensitive' } },
    include: { quizzes: { include: { questions: true } }, lessons: true }
  });

  if (!course) {
    console.error('Course not found');
    return;
  }

  console.log(`Course: "${course.title}" (ID: ${course.id})`);

  // Find last lesson
  const lastLesson = await prisma.courseLesson.findFirst({
    where: { courseId: course.id },
    orderBy: { orderIndex: 'desc' }
  });

  console.log(`Last Lesson: "${lastLesson?.title}" (ID: ${lastLesson?.id})`);

  // Test atomic creation of a 4-question Quiz totaling 100 points
  const payload = {
    title: 'Examen Final de Certificación — Claude AI',
    passingScore: 80,
    totalScore: 100,
    scoreDistribution: 'MANUAL',
    questions: [
      { questionText: '¿Qué es Claude AI de Anthropic?', questionType: 'SINGLE', optionsJson: ['Un modelo de lenguaje de IA', 'Un sistema operativo', 'Una hoja de cálculo'], correctAnswer: 'Un modelo de lenguaje de IA', points: 25 },
      { questionText: '¿Qué es un Prompt?', questionType: 'SINGLE', optionsJson: ['Una instrucción dada a la IA', 'Un cable de red', 'Un periférico'], correctAnswer: 'Una instrucción dada a la IA', points: 25 },
      { questionText: '¿Cuál es el beneficio de la ventana de contexto extendida?', questionType: 'SINGLE', optionsJson: ['Analizar documentos extensos', 'Imprimir fotos', 'Bajar juegos'], correctAnswer: 'Analizar documentos extensos', points: 25 },
      { questionText: '¿Qué calificación se necesita para aprobar?', questionType: 'SINGLE', optionsJson: ['80%', '40%', '10%'], correctAnswer: '80%', points: 25 }
    ]
  };

  const result = await prisma.$transaction(async (tx) => {
    // Upsert quiz
    let quiz = await tx.quiz.findFirst({ where: { courseId: course.id } });
    if (!quiz) {
      quiz = await tx.quiz.create({
        data: {
          courseId: course.id,
          lessonId: lastLesson.id,
          title: payload.title,
          passingScore: payload.passingScore,
          totalScore: payload.totalScore,
          scoreDistribution: payload.scoreDistribution
        }
      });
    } else {
      quiz = await tx.quiz.update({
        where: { id: quiz.id },
        data: {
          title: payload.title,
          passingScore: payload.passingScore,
          totalScore: payload.totalScore,
          scoreDistribution: payload.scoreDistribution
        }
      });
    }

    // Replace questions
    await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
    for (let i = 0; i < payload.questions.length; i++) {
      const q = payload.questions[i];
      await tx.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionText: q.questionText,
          questionType: q.questionType,
          optionsJson: q.optionsJson,
          correctAnswer: q.correctAnswer,
          points: q.points,
          orderIndex: i + 1
        }
      });
    }

    return tx.quiz.findUnique({ where: { id: quiz.id }, include: { questions: true } });
  });

  console.log(`✓ Final Quiz Saved Successfully!`);
  console.log(`  - Quiz Title: ${result.title}`);
  console.log(`  - Passing Score: ${result.passingScore}%`);
  console.log(`  - Questions Count: ${result.questions.length}`);
  console.log(`  - Total Points: ${result.questions.reduce((sum, q) => sum + q.points, 0)}/100`);

  console.log('--- TEST FINISHED WITH 100% SUCCESS ---');
}

testFinalQuizSync().catch(console.error).finally(() => prisma.$disconnect());
