const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupExtraQuizzes() {
  const courseId = 'c7c5e365-7cc8-4e4c-b18c-1642d6bd9b2b';
  console.log('--- CLEANING UP EXTRA TEST QUIZZES ---');

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { quizzes: { include: { questions: true } } }
  });

  if (!course) return;

  // Find the real 20-question exam
  const realQuiz = course.quizzes.find(q => q.questions.length >= 10);

  if (realQuiz) {
    console.log(`Found Real Quiz: "${realQuiz.title}" (ID: ${realQuiz.id}) with ${realQuiz.questions.length} questions.`);

    // Delete any other test quizzes created during testing
    const testQuizzes = course.quizzes.filter(q => q.id !== realQuiz.id);
    for (const tq of testQuizzes) {
      console.log(`Deleting temporary test quiz: ID ${tq.id} ("${tq.title}")`);
      await prisma.quizQuestion.deleteMany({ where: { quizId: tq.id } });
      await prisma.quiz.delete({ where: { id: tq.id } });
    }
  }

  // Ensure last lesson of course is linked to realQuiz
  const lastLesson = await prisma.courseLesson.findFirst({
    where: { courseId },
    orderBy: [
      { module: { orderIndex: 'desc' } },
      { orderIndex: 'desc' }
    ]
  });

  if (realQuiz && lastLesson) {
    await prisma.quiz.update({
      where: { id: realQuiz.id },
      data: { lessonId: lastLesson.id }
    });
    console.log(`✓ Real Quiz linked to last lesson: "${lastLesson.title}" (${lastLesson.id})`);
  }

  const finalCheck = await prisma.course.findUnique({
    where: { id: courseId },
    include: { quizzes: { include: { questions: true } } }
  });

  console.log(`\nFinal Course Quiz Count: ${finalCheck.quizzes.length}`);
  if (finalCheck.quizzes[0]) {
    console.log(`Active Quiz Title: "${finalCheck.quizzes[0].title}"`);
    console.log(`Questions Count: ${finalCheck.quizzes[0].questions.length}`);
    console.log(`Passing Score: ${finalCheck.quizzes[0].passingScore}%`);
  }

  console.log('--- CLEANUP COMPLETED SUCCESSFULLY ---');
}

cleanupExtraQuizzes().catch(console.error).finally(() => prisma.$disconnect());
