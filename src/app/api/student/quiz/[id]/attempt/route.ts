import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { 
  generateCertificatePDF, 
  sendCertificateEmail, 
  sendFinalExamPassNoticeToAdmin 
} from '@/lib/mail';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || (session.role !== 'STUDENT' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('DEBUG: Quiz Attempt Payload:', body);
    const { answers, courseId: bodyCourseId } = body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        lesson: true,
        course: {
          select: { title: true }
        },
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Asegurar courseId (de la DB si no viene en el body)
    const finalCourseId = bodyCourseId || quiz.courseId;
    if (!finalCourseId) {
      console.error('ERROR: No courseId found for quiz attempt');
      return NextResponse.json({ error: 'CourseId is required' }, { status: 400 });
    }

    // BINDING_FIX: Eliminadas comprobaciones de datos legacy para forzar flujo UUID

    let totalPoints = 0;
    let earnedPoints = 0;

    const questionsAndResult = quiz.questions.map((q) => {
      const userAnswerId = answers[q.id];
      const qPoints = q.points || 1;
      totalPoints += qPoints;

      // ÁRBITRO INTELIGENTE: Prioridad 1: flag isCorrect | Prioridad 2: Fallback a legacy index
      const relationalCorrect = q.options.find(opt => opt.isCorrect);
      let correctAnswerId = relationalCorrect?.id;

      if (!correctAnswerId) {
        // Fallback: usar el primer índice del array correctAnswer [0, 1...]
        const legacyIndex = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
        const targetOrder = (parseInt(legacyIndex as string) || 0) + 1;
        const legacyCorrect = q.options.find(opt => opt.orderIndex === targetOrder);
        correctAnswerId = legacyCorrect?.id;
      }
      
      const isCorrect = userAnswerId === correctAnswerId && !!userAnswerId;
      
      if (isCorrect) {
        earnedPoints += qPoints;
        console.log(`[GRADING] Q: ${q.questionText} | CORRECT | Points: ${qPoints}`);
      } else {
        console.log(`[GRADING] Q: ${q.questionText} | WRONG | User: ${userAnswerId} | Expected: ${correctAnswerId}`);
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswerId,
        correctAnswerId,
        isCorrect
      };
    });

    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passingThreshold = quiz.passingScore || 80;
    const passed = scorePercentage >= passingThreshold;

    // Lógica de Upsert: Solo un registro por alumno por examen
    const existingAttempt = await prisma.quizAttempt.findUnique({
      where: { userId_quizId: { userId: session.userId, quizId: quiz.id } }
    });

    if (existingAttempt?.passed) {
       console.log('DEBUG: User already passed this quiz. Rejecting new submission.');
       return NextResponse.json({ 
         scorePercentage: existingAttempt.scorePercentage,
         passed: true,
         questionsAndResult: existingAttempt.answersJson,
         attempt: existingAttempt,
         alreadyPassed: true
       });
    }

    // Guardar o actualizar el intento
    const attempt = await prisma.quizAttempt.upsert({
      where: {
        userId_quizId: {
          userId: session.userId,
          quizId: quiz.id
        }
      },
      update: {
        scoreObtained: earnedPoints,
        scorePercentage,
        passed,
        answersJson: questionsAndResult, // En la DB guardamos todo para auditoría
        attemptNumber: { increment: 1 },
        submittedAt: new Date()
      },
      create: {
        userId: session.userId,
        courseId: finalCourseId,
        quizId: quiz.id,
        scoreObtained: earnedPoints,
        scorePercentage,
        passed,
        attemptNumber: 1,
        answersJson: questionsAndResult
      },
      include: { certification: true }
    });

    console.log('Success: QuizAttempt processed:', attempt.id, 'Passed:', passed);

    // Certificación si pasa
    let certification = null;
    if (passed) {
      certification = await prisma.certification.upsert({
        where: {
          userId_courseId: {
            userId: session.userId,
            courseId: finalCourseId
          }
        },
        update: {
          quizAttemptId: attempt.id,
          issuedAt: new Date()
        },
        create: {
          userId: session.userId,
          courseId: finalCourseId,
          quizAttemptId: attempt.id,
          certificateCode: `PLT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          issuedAt: new Date()
        }
      });

      // Misión: El Alumno lo logró - Empaquetado y Envío de Diploma
      try {
        // 1. Detectar si es Evaluación Final
        const higherQuizzes = await prisma.courseLesson.count({
          where: {
            courseId: finalCourseId,
            contentType: 'QUIZ',
            orderIndex: { gt: quiz.lesson?.orderIndex || 0 }
          }
        });

        if (higherQuizzes === 0) {
          console.log(`[CERT] Final Evaluation detected for ${session.userId}. Generating PDF...`);
          
          const userFresh = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { name: true, lastName: true, email: true }
          });

          if (userFresh) {
            const studentFullName = `${userFresh.name} ${userFresh.lastName}`;
            const pdfBuffer = await generateCertificatePDF(
              studentFullName,
              quiz.course.title,
              certification.certificateCode
            );

            const downloadLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/dashboard/student/certificates`;
            
            await sendCertificateEmail(
              userFresh.email,
              userFresh.name,
              quiz.course.title,
              downloadLink,
              { 
                filename: `Certificado_${quiz.course.title.replace(/\s+/g, '_')}.pdf`, 
                content: pdfBuffer 
              }
            );

            // 2. Notificar al Admin (Diego)
            await sendFinalExamPassNoticeToAdmin(studentFullName, quiz.course.title, scorePercentage);
          }
        }
      } catch (certError) {
        console.error('Error in automatic certification delivery:', certError);
        // We don't fail the request if email fails, but we log it
      }
    }

    // MOTOR CIEGO: Si no aprobó, eliminamos correctAnswerId de la respuesta para el frontend
    const sanitizedResults = questionsAndResult.map(res => {
      if (!passed) {
        const { correctAnswerId, ...rest } = res;
        return rest;
      }
      return res;
    });

    return NextResponse.json({
      scorePercentage,
      passed,
      questionsAndResult: sanitizedResults,
      attempt,
      certification
    });
  } catch (error) {
    console.error('API /student/quiz/[id]/attempt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
