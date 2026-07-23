import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courseId = 'c7c5e365-7cc8-4e4c-b18c-1642d6bd9b2b';
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            include: {
              quiz: {
                include: {
                  questions: {
                    orderBy: { orderIndex: 'asc' },
                    include: { options: { orderBy: { orderIndex: 'asc' } } }
                  }
                }
              }
            }
          }
        }
      },
      quizzes: {
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' },
            include: { options: { orderBy: { orderIndex: 'asc' } } }
          }
        }
      }
    }
  });

  if (!course) {
    console.log('Curso no encontrado');
    return;
  }

  console.log(`=== CURSO: ${course.title} ===`);
  console.log(`Estado: ${course.status} | Visibilidad: ${course.visibility}`);
  console.log(`Precio: ${course.price} | Horas: ${course.durationHours}`);
  console.log(`Categoría: ${course.category} | Nivel: ${course.level}\n`);

  console.log('--- MÓDULOS Y LECCIONES ---');
  course.modules.forEach(mod => {
    console.log(`[Módulo ${mod.orderIndex}] ${mod.title}`);
    mod.lessons.forEach(les => {
      console.log(`   - (Lección ${les.orderIndex}) [${les.contentType}] ${les.title}`);
      if (les.videoUrl) console.log(`     Video: ${les.videoUrl}`);
      if (les.isPreview) console.log(`     (Previsualización Gratis)`);
    });
  });

  console.log('\n--- EVALUACIONES GLOBALES (QUIZZES FINAL) ---');
  course.quizzes.forEach(quiz => {
    console.log(`[Examen] ${quiz.title} (Aprobación: ${quiz.passingScore}% | Total: ${quiz.totalScore} pts) | LessonId: ${quiz.lessonId}`);
    quiz.questions.forEach((q, qIdx) => {
      console.log(`   Q${qIdx + 1}: ${q.questionText} (${q.points} pts)`);
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        console.log(`      ${letter}) ${opt.optionText} ${opt.isCorrect ? '[CORRECTA]' : ''}`);
      });
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
