import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper para generar slug simple
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Quitar guiones duplicados
    .trim();
}

async function main() {
  const jsonPathArg = process.argv[2];
  if (!jsonPathArg) {
    console.error('Error: Debes proporcionar la ruta al archivo JSON del curso.');
    console.log('Uso: npx ts-node scratch/import_course.ts ruta/al/curso.json');
    process.exit(1);
  }

  const absolutePath = path.resolve(jsonPathArg);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: El archivo no existe en la ruta: ${absolutePath}`);
    process.exit(1);
  }

  const courseData = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));

  // 1. Buscar instructor
  const instructorEmail = courseData.instructorEmail || 'plattform26@gmail.com';
  const instructor = await prisma.user.findUnique({
    where: { email: instructorEmail }
  });

  if (!instructor) {
    console.error(`Error: No se encontró al instructor con email ${instructorEmail} en la base de datos.`);
    process.exit(1);
  }

  const instructorId = instructor.id;
  const slug = generateSlug(courseData.title);

  // Validar si el slug ya existe para este instructor
  const existingCourse = await prisma.course.findUnique({
    where: {
      instructorId_slug: {
        instructorId,
        slug
      }
    }
  });

  if (existingCourse) {
    console.error(`Error: Ya existe un curso con el slug "${slug}" para este instructor.`);
    process.exit(1);
  }

  // 2. Validar puntaje del examen (si existe)
  if (courseData.quiz) {
    const totalPoints = courseData.quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    if (totalPoints !== 100) {
      console.error(`Error: La suma de puntos del examen debe ser exactamente 100. (Suma actual: ${totalPoints})`);
      process.exit(1);
    }
  }

  console.log(`Creando curso: "${courseData.title}"...`);

  // 3. Crear el curso
  const createdCourse = await prisma.course.create({
    data: {
      instructorId,
      title: courseData.title,
      slug,
      description: courseData.description,
      previewText: courseData.previewText,
      category: courseData.category || 'STRATEGY_BUSINESS',
      level: courseData.level || 'BEGINNER',
      durationHours: courseData.durationHours || 0,
      price: courseData.price || 0,
      status: 'DRAFT', // Por defecto se crea en borrador
      visibility: 'PUBLIC'
    }
  });

  console.log(`✓ Curso creado con ID: ${createdCourse.id}`);

  let lastLessonId: string | null = null;

  // 4. Crear módulos y lecciones
  if (courseData.modules && courseData.modules.length > 0) {
    for (const mod of courseData.modules) {
      console.log(`Creando módulo: "${mod.title}"...`);
      const createdMod = await prisma.courseModule.create({
        data: {
          courseId: createdCourse.id,
          title: mod.title,
          orderIndex: mod.orderIndex
        }
      });

      if (mod.lessons && mod.lessons.length > 0) {
        for (const les of mod.lessons) {
          const createdLesson = await prisma.courseLesson.create({
            data: {
              courseId: createdCourse.id,
              moduleId: createdMod.id,
              title: les.title,
              subtitle: les.subtitle || null,
              contentText: les.contentText || '',
              videoUrl: les.videoUrl || null,
              contentType: les.contentType || 'TEXT',
              orderIndex: les.orderIndex,
              durationMinutes: les.durationMinutes || 0,
              isPreview: les.isPreview || false,
              funFact: les.funFact || null,
              summary: les.summary || null
            }
          });
          lastLessonId = createdLesson.id;
        }
      }
    }
  }

  // 5. Crear el Examen (Quiz) si se especificó y vincularlo a la última lección
  if (courseData.quiz && lastLessonId) {
    console.log(`Creando evaluación: "${courseData.quiz.title}"...`);
    const createdQuiz = await prisma.quiz.create({
      data: {
        courseId: createdCourse.id,
        lessonId: lastLessonId, // Vinculado a la última lección para vista previa del instructor
        title: courseData.quiz.title,
        passingScore: courseData.quiz.passingScore || 80,
        totalScore: 100,
        scoreDistribution: 'MANUAL'
      }
    });

    for (const q of courseData.quiz.questions) {
      const createdQuestion = await prisma.quizQuestion.create({
        data: {
          quizId: createdQuiz.id,
          questionText: q.questionText,
          questionType: q.questionType || 'SINGLE',
          points: q.points || 0,
          orderIndex: q.orderIndex,
          correctAnswer: [], // Legacy field, we store answers in options
          optionsJson: q.options.map((opt: any, idx: number) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect || false,
            orderIndex: idx + 1
          }))
        }
      });

      if (q.options && q.options.length > 0) {
        let correctIndices: number[] = [];
        for (let i = 0; i < q.options.length; i++) {
          const opt = q.options[i];
          const createdOption = await prisma.quizOption.create({
            data: {
              questionId: createdQuestion.id,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect || false,
              orderIndex: i + 1
            }
          });

          if (opt.isCorrect) {
            correctIndices.push(i);
          }
        }

        // Actualizar la pregunta con los índices de respuestas correctas (para compatibilidad de backend)
        await prisma.quizQuestion.update({
          where: { id: createdQuestion.id },
          data: {
            correctAnswer: correctIndices
          }
        });
      }
    }
    console.log(`✓ Evaluación creada con éxito.`);
  }

  console.log(`\n🎉 ¡Importación completada! El curso "${courseData.title}" ya está disponible en tu panel como Borrador.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
