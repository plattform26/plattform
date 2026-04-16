import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.id;
    const body = await req.json();
    const { title, passingScore, totalScore, scoreDistribution, questions } = body;

    // 1. Verify existence & ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { 
        quizzes: true,
        _count: { select: { enrollments: true } }
      }
    });

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    if (session.role !== 'ADMIN' && course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lógica de Bloqueo: Solo para Instructores si hay alumnos y curso activo
    const hasEnrollments = course._count.enrollments > 0;
    const isActive = course.status === 'PUBLISHED' || course.status === 'HIBERNATED';
    
    if (session.role === 'INSTRUCTOR' && hasEnrollments && isActive) {
        return NextResponse.json({ 
          error: 'CURSO_BLOQUEADO',
          message: 'No puedes modificar la evaluación de un curso con alumnos activos para proteger la integridad del examen.'
        }, { status: 403 });
    }

    // 2. Validate total points must be 100
    const calculatedTotal = questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 0), 0);
    if (calculatedTotal !== 100) {
        return NextResponse.json({ error: `El puntaje total debe sumar exactamente 100 (Recibido: ${calculatedTotal})` }, { status: 400 });
    }

    // 3. Transactional Sync (Atomic Wipe and Recreate)
    const result = await prisma.$transaction(async (tx) => {
        // Find or create quiz
        let quiz = course.quizzes[0];
        if (!quiz) {
            quiz = await tx.quiz.create({
                data: {
                    courseId,
                    title: title || 'Examen Final',
                    passingScore: passingScore || 80,
                    totalScore: 100,
                    scoreDistribution: scoreDistribution || 'MANUAL'
                }
              });
          } else {
              quiz = await tx.quiz.update({
                  where: { id: quiz.id },
                  data: {
                      title: title || quiz.title,
                      passingScore: passingScore || quiz.passingScore,
                      totalScore: 100,
                      scoreDistribution: scoreDistribution || quiz.scoreDistribution
                  }
              });
          }

          // Step 1: Wipe all existing questions and options (Cascade handles the link)
          await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });

          // Step 2: Recreate all from scratch based on current editor state
          for (let i = 0; i < questions.length; i++) {
              const q = questions[i];
              
              // Normalize data structure (support both simple strings and structured objects)
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
                      optionsJson: normalizedOptions, // Save as structured array for UI consistency
                      correctAnswer: JSON.stringify(normalizedOptions.find((o: any) => o.isCorrect) || normalizedOptions[0]),
                      points: Number(q.points) || 0,
                      orderIndex: i + 1,
                      options: {
                          create: normalizedOptions // Save to relational table
                      }
                  }
              });
          }

          // Update course flag
          await tx.course.update({
              where: { id: courseId },
              data: { hasQuiz: true }
          });

          return quiz;
      }, {
          timeout: 15000 // Extended timeout for large quizzes and complex transactions
      });

      return NextResponse.json(result);
  } catch (error: any) {
      console.error('--- ERROR FORENSE DE SINCRONIZACIÓN DE QUIZ ---');
      console.error('Timestamp:', new Date().toISOString());
      console.error('Stack:', error.stack);
      return NextResponse.json({ 
          error: 'Error al sincronizar la evaluación.',
          details: error.message
      }, { status: 500 });
  }
}
