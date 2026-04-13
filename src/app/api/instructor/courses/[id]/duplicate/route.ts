import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now();
  let debugData: any = null;

  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 0. Verificar Plan de Suscripción (Solo para Instructores)
    if (session.role === 'INSTRUCTOR') {
      const instructorProfile = await prisma.instructorProfile.findUnique({
        where: { userId: session.userId },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1
          }
        }
      });

      const activePlan = instructorProfile?.subscriptions[0]?.plan.name;
      if (activePlan !== 'scale') {
        return NextResponse.json({ 
          error: 'La duplicación de cursos es un beneficio exclusivo del Plan Scale.',
          code: 'UPGRADE_REQUIRED'
        }, { status: 403 });
      }
    }

    console.log('--- INICIANDO DUPLICACIÓN (TWO-STEP ATOMIC MODE) ---');
    
    // 1. Obtener la estructura original (EXCLUSIÓN ESTRICTA: CourseRating NO se incluye)
    const originalCourse = await prisma.course.findUnique({
      where: { id: params.id },
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
                      include: { options: { orderBy: { orderIndex: 'asc' } } },
                      orderBy: { orderIndex: 'asc' }
                    } 
                  } 
                } 
              }
            }
          }
        },
        quizzes: {
          where: { lessonId: null },
          include: {
            questions: {
              include: { options: { orderBy: { orderIndex: 'asc' } } },
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    if (!originalCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (session.role === 'INSTRUCTOR' && originalCourse.instructorId !== session.userId) {
      return NextResponse.json({ error: 'No tienes permiso para duplicar este curso' }, { status: 403 });
    }

    // Preparación de datos (Detach total y sanitización)
    const raw = JSON.parse(JSON.stringify(originalCourse));
    const hash = Math.random().toString(36).substring(2, 7);
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    const courseLevel = validLevels.includes(raw.level) ? raw.level : 'BEGINNER';

    // 2. EJECUCIÓN ATÓMICA EN DOS PASOS DENTRO DE TRANSACCIÓN
    const newCourse = await prisma.$transaction(async (tx) => {
      
      // PASO 1: Crear el "Shell" del Curso
      const createdCourse = await tx.course.create({
        data: {
          instructorId: String(raw.instructorId),
          title: `Copia de ${raw.title}`,
          slug: `copia-de-${raw.slug}-${hash}`,
          description: raw.description || "",
          category: String(raw.category || "OTHER"),
          level: courseLevel,
          durationHours: raw.durationHours ? Number(raw.durationHours) : 0,
          price: Number(raw.price) || 0,
          currency: raw.currency || "MXN",
          status: 'DRAFT',
          visibility: 'PRIVATE',
          thumbnailUrl: raw.thumbnailUrl || null,
          previewText: raw.previewText || null,
          hasQuiz: Boolean(raw.hasQuiz),
        }
      });

      // PASO 2: Mapear Hijos con ID EXPLÍCITO (courseId)
      
      // 2.2 Reconstruir Módulos y Lecciones
      for (const mod of (raw.modules || [])) {
        await tx.courseModule.create({
          data: {
            courseId: createdCourse.id, // Vínculo explícito
            title: mod.title,
            orderIndex: Number(mod.orderIndex),
            lessons: {
              create: (mod.lessons || []).map((lesson: any) => ({
                courseId: createdCourse.id, // <--- CRUCIAL: Vínculo explícito a nivel lección
                title: lesson.title,
                subtitle: lesson.subtitle || null,
                contentText: lesson.contentText || "",
                videoUrl: lesson.videoUrl || null,
                contentType: lesson.contentType,
                orderIndex: Number(lesson.orderIndex),
                durationMinutes: Number(lesson.durationMinutes) || 0,
                isPreview: Boolean(lesson.isPreview),
                funFact: lesson.funFact || null,
                summary: lesson.summary || null,
                // Quiz anidado en lección
                quiz: lesson.quiz ? {
                  create: {
                    courseId: createdCourse.id, // <--- CRUCIAL: Vínculo explícito a nivel quiz
                    title: lesson.quiz.title,
                    passingScore: Number(lesson.quiz.passingScore) || 80,
                    totalScore: Number(lesson.quiz.totalScore) || 100,
                    scoreDistribution: lesson.quiz.scoreDistribution || 'AUTOMATIC',
                    questions: {
                      create: (lesson.quiz.questions || []).map((q: any) => ({
                        questionText: q.questionText,
                        questionType: q.questionType,
                        optionsJson: q.optionsJson || {},
                        correctAnswer: q.correctAnswer || {},
                        points: Number(q.points) || 1,
                        orderIndex: Number(q.orderIndex),
                        options: {
                          create: (q.options || []).map((opt: any) => ({
                            optionText: opt.optionText,
                            isCorrect: Boolean(opt.isCorrect),
                            orderIndex: Number(opt.orderIndex)
                          }))
                        }
                      }))
                    }
                  }
                } : undefined
              }))
            }
          }
        });
      }

      // 2.3 Reconstruir Quices Globales (Examen Final, etc.)
      for (const q of (raw.quizzes || [])) {
        await tx.quiz.create({
          data: {
            courseId: createdCourse.id, // Vínculo explícito
            title: q.title,
            passingScore: Number(q.passingScore) || 80,
            totalScore: Number(q.totalScore) || 100,
            scoreDistribution: q.scoreDistribution || 'AUTOMATIC',
            questions: {
              create: (q.questions || []).map((qq: any) => ({
                questionText: qq.questionText,
                questionType: qq.questionType,
                optionsJson: qq.optionsJson || {},
                correctAnswer: qq.correctAnswer || {},
                points: Number(qq.points) || 1,
                orderIndex: Number(qq.orderIndex),
                options: {
                  create: (qq.options || []).map((opt: any) => ({
                    optionText: opt.optionText,
                    isCorrect: Boolean(opt.isCorrect),
                    orderIndex: Number(opt.orderIndex)
                  }))
                }
              }))
            }
          }
        });
      }

      return createdCourse;
    });

    const endTime = Date.now();
    console.log(`--- DUPLICACIÓN ÉXITO --- Tiempo: ${endTime - startTime}ms`);

    return NextResponse.json(newCourse);
  } catch (error: any) {
    console.error('--- FALLO CRÍTICO EN DUPLICACIÓN (TWO-STEP) ---');
    console.error('ERROR:', error.message);
    if (error.stack) console.error('STACK:', error.stack.substring(0, 500));
    
    return NextResponse.json({ 
      error: 'Error de integridad referencial en la base de datos',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
