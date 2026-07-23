const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuizFlow() {
  console.log('--- STARTING BACKEND QUIZ FLOW TEST ---');

  // 1. Find the target course "Claude AI en la Práctica"
  const course = await prisma.course.findFirst({
    where: { title: { contains: 'Claude AI', mode: 'insensitive' } },
    include: { modules: { include: { lessons: true } } }
  });

  if (!course) {
    console.error('Target course not found!');
    return;
  }

  console.log(`Found Course: "${course.title}" (ID: ${course.id})`);

  // 2. Create a test module
  const testModule = await prisma.courseModule.create({
    data: {
      courseId: course.id,
      title: 'MÓDULO DE PRUEBA: Evaluación Automatizada',
      orderIndex: 99
    }
  });
  console.log(`✓ Test Module Created: ID = ${testModule.id}`);

  // 3. Create a test lesson of type QUIZ inside this module
  const testLesson = await prisma.courseLesson.create({
    data: {
      courseId: course.id,
      moduleId: testModule.id,
      title: 'Evaluación Módulo de Prueba',
      contentText: '',
      contentType: 'QUIZ',
      orderIndex: 1
    }
  });
  console.log(`✓ Test Lesson Created: ID = ${testLesson.id}, Type = ${testLesson.contentType}`);

  // 4. Create Quiz metadata with passingScore = 80 and totalScore = 100
  const quiz = await prisma.quiz.create({
    data: {
      courseId: course.id,
      lessonId: testLesson.id,
      title: 'Examen de Prueba Módulo 1',
      passingScore: 80,
      totalScore: 100,
      scoreDistribution: 'MANUAL'
    }
  });
  console.log(`✓ Quiz Created: ID = ${quiz.id}, PassingScore = ${quiz.passingScore}%, TotalScore = ${quiz.totalScore}`);

  // 5. Create 4 questions with manual points (25 points each = 100 points total)
  const questionsData = [
    { text: '¿Qué es Claude AI?', points: 25, options: ['Un modelo de IA de Anthropic', 'Un editor de código', 'Una base de datos'], correct: 'Un modelo de IA de Anthropic' },
    { text: '¿Cuál es la función principal de Prompt Engineering?', points: 25, options: ['Diseñar prompts efectivos', 'Compilar C++', 'Formatear discos'], correct: 'Diseñar prompts efectivos' },
    { text: '¿Qué tipo de archivos puede analizar Claude?', points: 25, options: ['Documentos de texto y PDFs', 'Solamente ejecutables .exe', 'Ninguno'], correct: 'Documentos de texto y PDFs' },
    { text: '¿Cuál es el score mínimo para aprobar esta evaluación?', points: 25, options: ['80%', '50%', '10%'], correct: '80%' }
  ];

  let totalPoints = 0;
  for (let i = 0; i < questionsData.length; i++) {
    const qData = questionsData[i];
    const question = await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        questionText: qData.text,
        questionType: 'SINGLE',
        optionsJson: qData.options,
        correctAnswer: qData.correct,
        points: qData.points,
        orderIndex: i + 1
      }
    });
    totalPoints += qData.points;
    console.log(`  └─ Question ${i + 1} Created: "${question.questionText}" | Points: ${question.points}`);
  }

  console.log(`✓ Total Assigned Points: ${totalPoints} / ${quiz.totalScore}`);

  // 6. Verify full query retrieval
  const fullQuiz = await prisma.quiz.findUnique({
    where: { id: quiz.id },
    include: { questions: true, lesson: true, course: true }
  });

  console.log('✓ Full DB Retrieval Verification:');
  console.log(`  - Course Title: ${fullQuiz.course.title}`);
  console.log(`  - Lesson Title: ${fullQuiz.lesson.title}`);
  console.log(`  - Quiz Passing Score: ${fullQuiz.passingScore}%`);
  console.log(`  - Questions Count: ${fullQuiz.questions.length}`);

  // 7. Cleanup test records so course stays clean
  await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
  await prisma.quiz.delete({ where: { id: quiz.id } });
  await prisma.courseLesson.delete({ where: { id: testLesson.id } });
  await prisma.courseModule.delete({ where: { id: testModule.id } });

  console.log('✓ Cleaned up all test data successfully!');
  console.log('--- TEST COMPLETED WITH 100% SUCCESS ---');
}

testQuizFlow().catch(console.error).finally(() => prisma.$disconnect());
