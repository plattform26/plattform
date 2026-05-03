import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const idsToDelete = ['c2c7e56c-2e30-4db8-bcba-0d7dd7162e9b', 'b8573a34-7281-421f-af11-bff33a2211d8'];
const courseId = 'c50526a8-4494-4850-896d-368ff1a6170d';

async function main() {
  console.log('Verifying orphaned lessons before deletion...\n');

  const lessons = await prisma.courseLesson.findMany({
    where: { id: { in: idsToDelete } },
    include: {
      progressRecords: true,
      quiz: {
        include: {
          attempts: true
        }
      }
    }
  });

  if (lessons.length === 0) {
    console.log('Lessons not found or already deleted.');
    return;
  }

  let safeToDelete = true;
  for (const l of lessons) {
    const progressCount = l.progressRecords.length;
    const quizAttemptCount = l.quiz?.attempts?.length || 0;
    
    console.log(`Lesson: ${l.title} (ID: ${l.id})`);
    console.log(`- Progress Records: ${progressCount}`);
    console.log(`- Quiz Attempts: ${quizAttemptCount}`);

    if (progressCount > 0 || quizAttemptCount > 0) {
      safeToDelete = false;
    }
  }

  if (!safeToDelete) {
    console.error('\nCRITICAL: One or more lessons have associated student data. ABORTING DELETION.');
    return;
  }

  console.log('\nSafe to delete. Proceeding...');

  const deleted = await prisma.courseLesson.deleteMany({
    where: { id: { in: idsToDelete } }
  });

  console.log(`\nSUCCESS: ${deleted.count} lessons deleted.`);

  // Verify total count
  const totalCount = await prisma.courseLesson.count({
    where: { courseId }
  });
  console.log(`Total lessons remaining in course: ${totalCount}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
