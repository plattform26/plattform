import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEARCHING FOR "Cruz Azul" ---');
  
  const courses = await prisma.course.findMany({
    where: { title: { contains: 'Cruz Azul', mode: 'insensitive' } }
  });
  courses.forEach(c => console.log(`Course: ${c.id} | ${c.title}`));

  const lessons = await prisma.courseLesson.findMany({
    where: { title: { contains: 'Cruz Azul', mode: 'insensitive' } }
  });
  lessons.forEach(l => console.log(`Lesson: ${l.id} | ${l.title}`));

  const quizzes = await prisma.quiz.findMany({
    where: { title: { contains: 'Cruz Azul', mode: 'insensitive' } },
    include: { questions: { include: { options: true } } }
  });
  
  quizzes.forEach(q => {
    console.log(`Quiz: ${q.id} | ${q.title}`);
    q.questions.forEach((qu, i) => {
      console.log(`  Question ${i+1}: ${qu.questionText} (${qu.options.length} options)`);
      qu.options.forEach(o => {
        console.log(`    - [${o.isCorrect ? 'X' : ' '}] ${o.optionText} (ID: ${o.id})`);
      });
    });
  });

  // If not found by name, search by ID prefix 9d64fc58
  console.log('\n--- SEARCHING FOR ID PREFIX 9d64fc58 ---');
  const quizzesById = await prisma.quiz.findMany({
    where: { id: { startsWith: '9d64fc58' } },
    include: { questions: { include: { options: true } } }
  });
  quizzesById.forEach(q => {
    console.log(`Quiz (by ID): ${q.id} | ${q.title}`);
    q.questions.forEach((qu, i) => {
      console.log(`  Question ${i+1}: ${qu.questionText} (${qu.options.length} options)`);
    });
  });

}

main().catch(console.error).finally(() => prisma.$disconnect());
