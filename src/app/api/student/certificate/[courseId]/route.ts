import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const certificate = await prisma.certification.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId: params.courseId } }
    });

    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verificar si ya tiene uno
    const existing = await prisma.certification.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId: params.courseId } }
    });
    if (existing) return NextResponse.json(existing);

    // 2. Verificar progreso (100%)
    const lessons = await prisma.courseLesson.count({ where: { courseId: params.courseId } });
    const completed = await prisma.progress.count({ where: { userId: session.userId, courseId: params.courseId, completed: true } });

    if (completed < lessons) {
      return NextResponse.json({ error: 'Progress incomplete' }, { status: 403 });
    }

    // 3. Verificar evaluación final aprobada (la última lección tipo QUIZ)
    const lastQuizLesson = await prisma.courseLesson.findFirst({
        where: { courseId: params.courseId, contentType: 'QUIZ' },
        orderBy: { orderIndex: 'desc' },
        include: { quiz: true }
    });

    if (lastQuizLesson?.quiz) {
        const bestAttempt = await prisma.quizAttempt.findFirst({
            where: { userId: session.userId, quizId: lastQuizLesson.quiz.id, passed: true },
            orderBy: { scorePercentage: 'desc' }
        });
        if (!bestAttempt) {
            return NextResponse.json({ error: 'Final evaluation not passed' }, { status: 403 });
        }
    }

    // 4. Generar código único PLT-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await prisma.certification.count();
    const seq = (count + 1).toString().padStart(4, '0');
    const certificateCode = `PLT-${year}-${seq}`;

    // 5. Crear certificado
    const cert = await prisma.certification.create({
      data: {
        userId: session.userId,
        courseId: params.courseId,
        certificateCode,
        issuedAt: new Date(),
      }
    });

    // 6. Notificar
    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: 'CERTIFICATE_ISSUED',
        title: '🎓 ¡Certificado obtenido!',
        message: 'Has completado satisfactoriamente el curso. Ya puedes ver tu certificado oficial.',
        relatedEntityType: 'CERTIFICATION',
        relatedEntityId: cert.id,
      }
    });

    return NextResponse.json(cert);
  } catch (error) {
    console.error('API /student/certificate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
