import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Setup de Prueba de Fuego ---');

  // 1. Asegurar Instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'alejandro@plattform.com' },
    update: {},
    create: {
      email: 'alejandro@plattform.com',
      name: 'Alejandro',
      lastName: 'Instructor',
      passwordHash: '$2b$10$vI8.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0', // dummy
      role: 'INSTRUCTOR'
    }
  });

  // 2. Asegurar Alumno
  const student = await prisma.user.upsert({
    where: { email: 'alumno@plattform.com' },
    update: {},
    create: {
      email: 'alumno@plattform.com',
      name: 'Diego',
      lastName: 'Alumno',
      passwordHash: '$2a$12$fT7zW6tJ/vI8.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0.uS0', // dummy (Plattform2025 hash si existe)
      role: 'STUDENT'
    }
  });

  // 3. Crear Curso
  const course = await prisma.course.upsert({
    where: { instructorId_slug: { instructorId: instructor.id, slug: 'certificacion-logica-pura' } },
    update: { status: 'PUBLISHED', hasQuiz: true, price: 0 },
    create: {
      instructorId: instructor.id,
      title: 'Certificación de Lógica Pura',
      slug: 'certificacion-logica-pura',
      description: 'Curso automatizado para validar el motor pedagógico.',
      category: 'TECHNOLOGY',
      level: 'ADVANCED',
      price: 0,
      status: 'PUBLISHED',
      hasQuiz: true
    }
  });

  // 4. Crear Módulo y Lección
  const module = await prisma.courseModule.create({
    data: {
      courseId: course.id,
      title: 'Módulo Único',
      orderIndex: 0
    }
  });

  const lesson = await prisma.courseLesson.create({
    data: {
      courseId: course.id,
      moduleId: module.id,
      title: 'Examen de Lógica',
      contentText: 'Supera este examen para obtener tu diploma.',
      contentType: 'QUIZ',
      orderIndex: 0
    }
  });

  // 5. Crear Quiz (Passing 100)
  const quiz = await prisma.quiz.upsert({
    where: { lessonId: lesson.id },
    update: { passingScore: 100, totalScore: 2 },
    create: {
      courseId: course.id,
      lessonId: lesson.id,
      title: 'Evaluación de Lógica Pura',
      passingScore: 100,
      totalScore: 2
    }
  });

  // 6. Crear Preguntas (2 preguntas)
  const q1 = await prisma.quizQuestion.create({
    data: {
      quizId: quiz.id,
      questionText: '¿Es 1 igual a 1?',
      questionType: 'SINGLE',
      correctAnswer: {},
      points: 1,
      orderIndex: 0
    }
  });

  await prisma.quizOption.createMany({
    data: [
      { questionId: q1.id, optionText: 'Sí, es Lógico', isCorrect: true, orderIndex: 0 },
      { questionId: q1.id, optionText: 'No, es Ilógico', isCorrect: false, orderIndex: 1 }
    ]
  });

  const q2 = await prisma.quizQuestion.create({
    data: {
      quizId: quiz.id,
      questionText: '¿Es el cielo azul?',
      questionType: 'SINGLE',
      correctAnswer: {},
      points: 1,
      orderIndex: 1
    }
  });

  await prisma.quizOption.createMany({
    data: [
      { questionId: q2.id, optionText: 'Claro que sí', isCorrect: true, orderIndex: 0 },
      { questionId: q2.id, optionText: 'Depende de la lluvia', isCorrect: false, orderIndex: 1 }
    ]
  });

  // 7. Inscribir Alumno
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      status: 'ACTIVE'
    }
  });

  console.log('--- Setup Completado ---');
  console.log('Curso Slug:', course.slug);
  console.log('Lección ID:', lesson.id);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
