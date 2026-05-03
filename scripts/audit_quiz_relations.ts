import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const courseId = 'c50526a8-4494-4850-896d-368ff1a6170d';

async function main() {
  console.log(`Auditing Quiz Relationships for course: ${courseId}\n`);

  // Query 1: Get Quiz by courseId
  const quizzes = await prisma.quiz.findMany({
    where: { courseId },
    include: {
      lesson: {
        include: { module: true }
      },
      _count: { select: { questions: true } }
    }
  });

  console.log('--- QUIZZES ---');
  if (quizzes.length === 0) {
    console.log('No quizzes found for this courseId.');
  } else {
    quizzes.forEach(q => {
      console.log(`Quiz ID: ${q.id} | Title: ${q.title} | Passing Score: ${q.passingScore}`);
      console.log(`lessonId: ${q.lessonId || 'NULL'}`);
      console.log(`Questions Count: ${q._count.questions}`);
      if (q.lesson) {
        console.log(`Attached to Lesson: ${q.lesson.title} (ID: ${q.lesson.id})`);
        console.log(`Module: ${q.lesson.module?.title || 'N/A'} | Module Order: ${q.lesson.module?.orderIndex}`);
      }
    });
  }

  // Find Last Lesson
  const allLessons = await prisma.courseLesson.findMany({
    where: { courseId, moduleId: { not: null } },
    include: { module: true },
    orderBy: [
      { module: { orderIndex: 'desc' } },
      { orderIndex: 'desc' }
    ],
    take: 1
  });

  console.log('\n--- LAST LESSON OF COURSE ---');
  if (allLessons.length > 0) {
    const l = allLessons[0];
    console.log(`ID: ${l.id} | Title: ${l.title} | Module: ${l.module?.title} | Order: ${l.orderIndex}`);
  } else {
    console.log('No valid lessons found.');
  }

  // Full Structure
  const fullStructure = await prisma.courseModule.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    include: {
      lessons: {
        orderBy: { orderIndex: 'asc' },
        include: { quiz: true }
      }
    }
  });

  console.log('\n--- FULL COURSE STRUCTURE ---');
  fullStructure.forEach(m => {
    m.lessons.forEach(l => {
      console.log(`Mod ${m.orderIndex} | Les ${l.orderIndex} | Quiz: ${l.quiz ? 'SÍ' : 'NO'} | Title: ${l.title} | ID: ${l.id}`);
    });
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
