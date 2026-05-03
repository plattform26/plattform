import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const orphanedLessonIds = ['c2c7e56c-2e30-4db8-bcba-0d7dd7162e9b', 'b8573a34-7281-421f-af11-bff33a2211d8'];
const courseId = 'c50526a8-4494-4850-896d-368ff1a6170d';
const studentEmail = 'azulno26@hotmail.com';

async function main() {
  console.log('--- PURGING ORPHANED CONTENT ---\n');

  // 1. Find User
  const user = await prisma.user.findUnique({
    where: { email: studentEmail }
  });

  if (!user) {
    console.warn(`User ${studentEmail} not found. Skipping progress deletion.`);
  } else {
    // 2. Delete Progress
    const deletedProgress = await prisma.progress.deleteMany({
      where: {
        lessonId: 'b8573a34-7281-421f-af11-bff33a2211d8',
        userId: user.id
      }
    });
    console.log(`Progress records deleted: ${deletedProgress.count}`);
  }

  // 3. Delete Lessons
  const deletedLessons = await prisma.courseLesson.deleteMany({
    where: {
      id: { in: orphanedLessonIds }
    }
  });
  console.log(`Lessons deleted: ${deletedLessons.count}`);

  // 4. Final Verifications
  const remainingOrphans = await prisma.courseLesson.count({
    where: { moduleId: null, courseId: courseId }
  });
  console.log(`Remaining orphans for this course: ${remainingOrphans}`);

  const totalLessons = await prisma.courseLesson.count({
    where: { courseId: courseId }
  });
  console.log(`Total lessons in course: ${totalLessons}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
