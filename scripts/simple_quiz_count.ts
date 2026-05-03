import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.quiz.count();
  console.log(`TOTAL_QUIZZES: ${count}`);
  const orphaned = await prisma.quiz.findMany({ where: { lessonId: null } });
  console.log(`ORPHANED_COUNT: ${orphaned.length}`);
  orphaned.forEach(q => console.log(`ORPHANED_ID: ${q.id} | COURSE_ID: ${q.courseId}`));
  await prisma.$disconnect();
}
main();
