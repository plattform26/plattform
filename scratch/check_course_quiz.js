const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourseQuiz() {
  const courseId = 'c7c5e365-7cc8-4e4c-b18c-1642d6bd9b2b';
  console.log(`--- CHECKING QUIZZES FOR COURSE ID: ${courseId} ---`);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      quizzes: {
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  });

  if (!course) {
    console.error('Course not found');
    return;
  }

  console.log(`Course Title: "${course.title}"`);
  console.log(`Total Quizzes found: ${course.quizzes.length}`);

  course.quizzes.forEach((q, idx) => {
    console.log(`\nQuiz #${idx + 1}:`);
    console.log(`  - ID: ${q.id}`);
    console.log(`  - Title: ${q.title}`);
    console.log(`  - Passing Score: ${q.passingScore}%`);
    console.log(`  - Total Score: ${q.totalScore}`);
    console.log(`  - Score Distribution: ${q.scoreDistribution}`);
    console.log(`  - Linked LessonId: ${q.lessonId}`);
    console.log(`  - Questions Count: ${q.questions.length}`);

    q.questions.forEach((qu, qIdx) => {
      console.log(`     [Q${qIdx + 1}] ID: ${qu.id} | Points: ${qu.points} | Text: "${qu.questionText}"`);
      console.log(`           Options:`, JSON.stringify(qu.optionsJson));
      console.log(`           Correct:`, JSON.stringify(qu.correctAnswer));
    });
  });

  console.log('\n--- CHECK COMPLETED ---');
}

checkCourseQuiz().catch(console.error).finally(() => prisma.$disconnect());
