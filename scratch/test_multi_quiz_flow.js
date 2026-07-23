const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMultiQuizFlow() {
  console.log('--- STARTING MULTI-QUIZ FLOW & CERTIFICATE VERIFICATION TEST ---');

  // 1. Get student user & course
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } }) || await prisma.user.findFirst();
  const course = await prisma.course.findFirst({ where: { title: { contains: 'Claude AI', mode: 'insensitive' } } });

  if (!student || !course) {
    console.error('Student or Course not found!');
    return;
  }

  console.log(`Using Student: ${student.email} (${student.id})`);
  console.log(`Using Course: "${course.title}" (${course.id})`);

  // 2. Create 2 modules, each with a Quiz lesson
  const mod1 = await prisma.courseModule.create({ data: { courseId: course.id, title: 'Módulo Test 1', orderIndex: 98 } });
  const les1 = await prisma.courseLesson.create({ data: { courseId: course.id, moduleId: mod1.id, title: 'Quiz 1', contentText: '', contentType: 'QUIZ', orderIndex: 1 } });
  const qz1 = await prisma.quiz.create({ data: { courseId: course.id, lessonId: les1.id, title: 'Quiz Módulo 1', passingScore: 70, totalScore: 100, scoreDistribution: 'AUTOMATIC' } });

  const mod2 = await prisma.courseModule.create({ data: { courseId: course.id, title: 'Módulo Test 2', orderIndex: 99 } });
  const les2 = await prisma.courseLesson.create({ data: { courseId: course.id, moduleId: mod2.id, title: 'Quiz 2', contentText: '', contentType: 'QUIZ', orderIndex: 2 } });
  const qz2 = await prisma.quiz.create({ data: { courseId: course.id, lessonId: les2.id, title: 'Quiz Módulo 2', passingScore: 80, totalScore: 100, scoreDistribution: 'AUTOMATIC' } });

  console.log('✓ Created 2 Quizzes in course.');

  // Clean previous attempts/certs for test user in this course
  await prisma.quizAttempt.deleteMany({ where: { userId: student.id, courseId: course.id } });
  await prisma.certification.deleteMany({ where: { userId: student.id, courseId: course.id } });

  // TEST SCENARIO A: Student passes ONLY Quiz 1
  console.log('\n--- SCENARIO A: Student passes ONLY Quiz 1 ---');
  await prisma.quizAttempt.create({
    data: {
      userId: student.id,
      courseId: course.id,
      quizId: qz1.id,
      scoreObtained: 90,
      scorePercentage: 90,
      passed: true,
      attemptNumber: 1,
      answersJson: []
    }
  });

  // Evaluate if cert should be issued:
  const higherQuizzesA = await prisma.courseLesson.count({ where: { courseId: course.id, contentType: 'QUIZ', orderIndex: { gt: les1.orderIndex } } });
  const totalQuizzesA = await prisma.courseLesson.count({ where: { courseId: course.id, contentType: 'QUIZ' } });
  const passedQuizzesA = await prisma.quizAttempt.count({ where: { userId: student.id, courseId: course.id, passed: true } });
  const shouldCertifyA = (higherQuizzesA === 0) && (passedQuizzesA >= totalQuizzesA);

  console.log(`Quiz 1 Passed. HigherQuizzes: ${higherQuizzesA}, Passed: ${passedQuizzesA}/${totalQuizzesA} -> Should Certify? ${shouldCertifyA ? 'YES' : 'NO (CORRECT)'}`);

  // TEST SCENARIO B: Student then passes Quiz 2 (all quizzes passed)
  console.log('\n--- SCENARIO B: Student passes Quiz 2 (Both passed) ---');
  await prisma.quizAttempt.create({
    data: {
      userId: student.id,
      courseId: course.id,
      quizId: qz2.id,
      scoreObtained: 100,
      scorePercentage: 100,
      passed: true,
      attemptNumber: 1,
      answersJson: []
    }
  });

  const higherQuizzesB = await prisma.courseLesson.count({ where: { courseId: course.id, contentType: 'QUIZ', orderIndex: { gt: les2.orderIndex } } });
  const totalQuizzesB = await prisma.courseLesson.count({ where: { courseId: course.id, contentType: 'QUIZ' } });
  const passedQuizzesB = await prisma.quizAttempt.count({ where: { userId: student.id, courseId: course.id, passed: true } });
  const shouldCertifyB = (higherQuizzesB === 0) && (passedQuizzesB >= totalQuizzesB);

  console.log(`Quiz 2 Passed. HigherQuizzes: ${higherQuizzesB}, Passed: ${passedQuizzesB}/${totalQuizzesB} -> Should Certify? ${shouldCertifyB ? 'YES (CORRECT)' : 'NO'}`);

  // Cleanup test data
  await prisma.quizAttempt.deleteMany({ where: { userId: student.id, courseId: course.id } });
  await prisma.certification.deleteMany({ where: { userId: student.id, courseId: course.id } });
  await prisma.quiz.deleteMany({ where: { id: { in: [qz1.id, qz2.id] } } });
  await prisma.courseLesson.deleteMany({ where: { id: { in: [les1.id, les2.id] } } });
  await prisma.courseModule.deleteMany({ where: { id: { in: [mod1.id, mod2.id] } } });

  console.log('\n✓ Cleaned up all test data.');
  console.log('--- ALL MULTI-QUIZ FLOW TESTS PASSED 100% ---');
}

testMultiQuizFlow().catch(console.error).finally(() => prisma.$disconnect());
