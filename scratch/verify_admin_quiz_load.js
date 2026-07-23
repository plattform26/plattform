const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAdminQuizLoad() {
  const courseId = 'c7c5e365-7cc8-4e4c-b18c-1642d6bd9b2b';
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

  console.log(`Course Title: "${course.title}"`);
  console.log(`Active Quizzes: ${course.quizzes.length}`);

  const q = course.quizzes[0];
  console.log(`Quiz Title: "${q.title}"`);
  console.log(`Questions Count: ${q.questions.length}`);
  console.log(`Passing Score: ${q.passingScore}%`);

  const questionsMapped = q.questions.map(qq => {
    const mappedOptions = Array.isArray(qq.optionsJson) 
      ? qq.optionsJson.map((o) => ({ text: typeof o === 'object' ? (o.text || o.optionText || '') : String(o) })) 
      : [];
    return {
      text: qq.questionText,
      optionsCount: mappedOptions.length,
      points: qq.points
    };
  });

  console.log('Sample Questions:');
  questionsMapped.slice(0, 3).forEach((qm, i) => {
    console.log(`  [Q${i+1}] ${qm.text} (${qm.points} pts, ${qm.optionsCount} opts)`);
  });

  console.log('✓ ADMIN QUIZ LOAD VERIFIED SUCCESSFULLY!');
}

verifyAdminQuizLoad().catch(console.error).finally(() => prisma.$disconnect());
