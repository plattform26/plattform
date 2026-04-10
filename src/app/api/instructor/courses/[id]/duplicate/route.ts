import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Obtener el curso original con toda su estructura
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
        }
      }
    });

    if (!originalCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const timestamp = Date.now();
    const newSlug = `${originalCourse.slug}-copy-${timestamp}`;

    // 2. Crear la copia profunda usando transacciones de Prisma
    const newCourse = await prisma.course.create({
      data: {
        instructorId: originalCourse.instructorId,
        title: `${originalCourse.title} (Copia)`,
        slug: newSlug,
        description: originalCourse.description,
        category: originalCourse.category,
        level: originalCourse.level,
        durationHours: originalCourse.durationHours,
        price: originalCourse.price,
        currency: originalCourse.currency,
        status: 'DRAFT',
        visibility: 'PRIVATE',
        thumbnailUrl: originalCourse.thumbnailUrl,
        previewText: originalCourse.previewText,
        hasQuiz: originalCourse.hasQuiz,
        modules: {
          create: originalCourse.modules.map(mod => ({
            title: mod.title,
            orderIndex: mod.orderIndex,
            lessons: {
              create: mod.lessons.map(lesson => ({
                title: lesson.title,
                subtitle: lesson.subtitle,
                contentText: lesson.contentText,
                videoUrl: lesson.videoUrl,
                contentType: lesson.contentType,
                orderIndex: lesson.orderIndex,
                durationMinutes: lesson.durationMinutes,
                isPreview: lesson.isPreview,
                funFact: lesson.funFact,
                summary: lesson.summary,
                // Clonar Quiz si existe en la lección
                quiz: lesson.quiz ? {
                  create: {
                    title: lesson.quiz.title,
                    passingScore: lesson.quiz.passingScore,
                    totalScore: lesson.quiz.totalScore,
                    scoreDistribution: lesson.quiz.scoreDistribution,
                    // El courseId se asignará automáticamente por la relación de Course -> Quiz
                    // al estar anidado en el create del Course principal.
                    questions: {
                      create: lesson.quiz.questions.map(q => ({
                        questionText: q.questionText,
                        questionType: q.questionType,
                        correctAnswer: q.correctAnswer || {},
                        points: q.points,
                        orderIndex: q.orderIndex,
                        options: {
                          create: q.options.map(opt => ({
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            orderIndex: opt.orderIndex,
                          }))
                        }
                      }))
                    }
                  }
                } : undefined
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json(newCourse);
  } catch (error: any) {
    console.error('Duplication Error:', error);
    return NextResponse.json({ error: error.message || 'Error duplicating course' }, { status: 500 });
  }
}
