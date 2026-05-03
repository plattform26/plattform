import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const quizzes = await prisma.quiz.findMany({ include: { course: true } });
  quizzes.forEach(q => {
    console.log(`ID: ${q.id} | LessonId: ${q.lessonId} | Course: ${q.course.title}`);
  });
  await prisma.$disconnect();
}
main();
