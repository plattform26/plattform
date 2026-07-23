import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { syncQuizSchema } from '@/lib/validations/courses';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  // Using POST and PATCH to point to the same handler
  return handleRequest(req, props);
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  return handleRequest(req, props);
}

async function handleRequest(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
      const session = await getSession();
      if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const moduleId = params.id;
      const body = await req.json();
      const validation = syncQuizSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json({ 
          error: 'Datos inválidos', 
          details: validation.error.format() 
        }, { status: 400 });
      }

      const { title, passingScore, questions } = validation.data;

      // 1. Verify module existence & ownership
      const module = await prisma.courseModule.findUnique({
        where: { id: moduleId },
        include: { course: true, lessons: true }
      });

      if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });
      if (session.role !== 'ADMIN' && module.course.instructorId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // 2. Validate total points must be 100
      const calculatedTotal = questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 0), 0);
      if (calculatedTotal !== 100) {
          return NextResponse.json({ error: `El puntaje total debe sumar exactamente 100 (Recibido: ${calculatedTotal})` }, { status: 400 });
      }

      // 3. Transactional Sync (Atomic Wipe and Recreate)
      const result = await prisma.$transaction(async (tx) => {
          // Check if there's already a quiz lesson for this module (Paso 3 mitigation)
          let quizLesson = await tx.courseLesson.findFirst({
            where: { moduleId: module.id, contentType: 'QUIZ' },
            orderBy: { orderIndex: 'desc' }
          });

          if (!quizLesson) {
             const lastLessonIndex = module.lessons.length > 0 
                ? Math.max(...module.lessons.map(l => l.orderIndex)) 
                : 0;

             quizLesson = await tx.courseLesson.create({
                data: {
                  courseId: module.courseId,
                  moduleId: module.id,
                  title: title || `Evaluación — ${module.title}`,
                  subtitle: 'Evaluación de conocimientos del módulo',
                  contentText: '',
                  contentType: 'QUIZ',
                  orderIndex: lastLessonIndex + 1,
                  durationMinutes: 15,
                }
             });
          } else {
             // Si el título cambió, actualizar la lección también
             if (title && title !== quizLesson.title) {
                 await tx.courseLesson.update({
                     where: { id: quizLesson.id },
                     data: { title }
                 });
             }
          }

          // Find or create quiz
          let quiz = await tx.quiz.findFirst({
             where: { lessonId: quizLesson.id }
          });

          if (!quiz) {
              // Create linked quiz
              quiz = await tx.quiz.create({
                  data: {
                      courseId: module.courseId,
                      lessonId: quizLesson.id,
                      title: title || `Evaluación — ${module.title}`,
                      passingScore: passingScore || 80,
                      totalScore: 100,
                      scoreDistribution: 'MANUAL'
                  }
                });
            } else {
                quiz = await tx.quiz.update({
                    where: { id: quiz.id },
                    data: {
                        title: title || quiz.title,
                        passingScore: passingScore || quiz.passingScore,
                        totalScore: 100
                    }
                });
            }

            // Step 1: Wipe all existing questions and options (Cascade handles the link)
            await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });

            // Step 2: Recreate all from scratch based on current editor state
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                
                // Normalize data structure
                const rawOptions = Array.isArray(q.optionsJson) ? q.optionsJson : [];
                const normalizedOptions = rawOptions.map((opt: any, idx: number) => {
                    const text = typeof opt === 'object' ? (opt.optionText || opt.text || '') : String(opt);
                    const isCorrectFlag = typeof opt === 'object' && opt.isCorrect === true;
                    
                    return {
                        optionText: text,
                        isCorrect: Array.isArray(q.correctAnswer) 
                            ? q.correctAnswer.includes(idx) 
                            : (q.correctAnswer === idx || isCorrectFlag),
                        orderIndex: idx + 1
                    };
                });

                await tx.quizQuestion.create({
                    data: {
                        quizId: quiz.id,
                        questionText: q.questionText,
                        questionType: q.questionType || 'SINGLE',
                        optionsJson: normalizedOptions,
                        correctAnswer: JSON.stringify(normalizedOptions.find((o: any) => o.isCorrect) || normalizedOptions[0]),
                        points: Number(q.points) || 0,
                        orderIndex: i + 1,
                        options: {
                            create: normalizedOptions
                        }
                    }
                });
            }

            return quiz;
        }, {
            timeout: 15000
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('--- ERROR API MODULE QUIZ ---');
        console.error(error);
        return NextResponse.json({ 
            error: 'Error al guardar la evaluación del módulo.',
            details: error.message
        }, { status: 500 });
    }
}
