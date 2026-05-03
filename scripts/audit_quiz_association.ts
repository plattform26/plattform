import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const courseId = 'c50526a8-4494-4850-896d-368ff1a6170d';

async function main() {
  console.log(`Auditing Quiz for course: ${courseId}\n`);

  const quizzes = await prisma.quiz.findMany({
    where: { 
      lesson: {
        courseId: courseId
      }
    },
    include: {
      lesson: {
        include: {
          module: true
        }
      }
    }
  });

  console.log('--- QUIZZES ---');
  if (quizzes.length === 0) {
    console.log('No quizzes found for this course.');
  } else {
    quizzes.forEach(q => {
      console.log(`Quiz ID: ${q.id} | Title: ${q.title}`);
      console.log(`Attached to Lesson: ${q.lesson?.title} (ID: ${q.lessonId})`);
      console.log(`Module: ${q.lesson?.module?.title || 'N/A'}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
