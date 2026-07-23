const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTrashTestLessons() {
  const courseId = 'c7c5e365-7cc8-4e4c-b18c-1642d6bd9b2b';
  console.log('--- INSPECTING AND CLEANING TRASH TEST LESSONS/MODULES ---');

  const lessonIdsToDelete = [
    '3aa86281-06f6-420e-a0bb-2f1bfc55c64a', // "Examen del Módulo"
    'faa15cd4-7f2f-4d9e-99a8-88d6321b6432'  // "LECION PRUEBVA"
  ];

  // 1. Delete test lessons
  for (const lId of lessonIdsToDelete) {
    const l = await prisma.courseLesson.findUnique({ where: { id: lId } });
    if (l) {
      console.log(`Deleting test lesson: "${l.title}" (${l.id})`);
      // Delete progress & quizzes linked to it
      await prisma.progress.deleteMany({ where: { lessonId: lId } });
      await prisma.courseLesson.delete({ where: { id: lId } });
    }
  }

  // 2. Delete test modules if empty or created for tests
  const testModules = await prisma.courseModule.findMany({
    where: {
      courseId,
      OR: [
        { title: { contains: 'PRUEBA', mode: 'insensitive' } },
        { title: { contains: 'quiz', mode: 'insensitive' } }
      ]
    },
    include: { lessons: true }
  });

  for (const tm of testModules) {
    if (tm.lessons.length === 0) {
      console.log(`Deleting empty test module: "${tm.title}" (${tm.id})`);
      await prisma.courseModule.delete({ where: { id: tm.id } });
    }
  }

  // 3. Find the real last lesson of the original curriculum (e.g. "Lección 4.3: Límites éticos y buenas prácticas")
  const realLastLesson = await prisma.courseLesson.findFirst({
    where: { courseId },
    orderBy: [
      { module: { orderIndex: 'desc' } },
      { orderIndex: 'desc' }
    ],
    include: { module: true }
  });

  console.log(`\nReal Last Lesson of Course: "${realLastLesson?.title}" (${realLastLesson?.id}) in Module "${realLastLesson?.module?.title}"`);

  // 4. Link the Real Quiz ("Dominio Práctico de Claude") to realLastLesson
  const realQuiz = await prisma.quiz.findFirst({
    where: { courseId },
    include: { questions: true }
  });

  if (realQuiz && realLastLesson) {
    await prisma.quiz.update({
      where: { id: realQuiz.id },
      data: { lessonId: realLastLesson.id }
    });
    console.log(`✓ Real Quiz "${realQuiz.title}" successfully linked to "${realLastLesson.title}"`);
  }

  // 5. Output remaining structure
  const remainingModules = await prisma.courseModule.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    include: { lessons: { orderBy: { orderIndex: 'asc' } } }
  });

  console.log('\n--- CLEAN REMAINING COURSE STRUCTURE ---');
  remainingModules.forEach((m, mIdx) => {
    console.log(`Module #${mIdx + 1}: ${m.title}`);
    m.lessons.forEach((l, lIdx) => {
      console.log(`   └─ Lesson #${lIdx + 1}: ${l.title} (${l.id})`);
    });
  });

  console.log('\n--- CLEANUP COMPLETE ---');
}

deleteTrashTestLessons().catch(console.error).finally(() => prisma.$disconnect());
