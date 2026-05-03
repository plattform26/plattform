import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const orphanedQuizId = '7a403598-fadd-4a61-bb48-72028817b2c0';

async function main() {
  console.log(`Fixing orphaned quiz: ${orphanedQuizId}\n`);

  // 1. Find the course of this quiz
  const quiz = await prisma.quiz.findUnique({
    where: { id: orphanedQuizId },
    include: { course: true }
  });

  if (!quiz) {
    console.error('Quiz not found.');
    return;
  }

  const courseId = quiz.courseId;
  console.log(`Course: ${quiz.course.title} (ID: ${courseId})`);

  // 2. Find the last lesson of this course
  const lastLesson = await prisma.courseLesson.findMany({
    where: { courseId, moduleId: { not: null } },
    include: { module: true },
    orderBy: [
      { module: { orderIndex: 'desc' } },
      { orderIndex: 'desc' }
    ],
    take: 1
  });

  if (lastLesson.length === 0) {
    console.error('No valid last lesson found for this course.');
    return;
  }

  const lessonId = lastLesson[0].id;
  console.log(`Target Lesson: ${lastLesson[0].title} (ID: ${lessonId})`);

  // 3. Update the quiz
  const updatedQuiz = await prisma.quiz.update({
    where: { id: orphanedQuizId },
    data: { lessonId: lessonId }
  });

  console.log(`\nSUCCESS: Quiz updated with lessonId: ${updatedQuiz.lessonId}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
