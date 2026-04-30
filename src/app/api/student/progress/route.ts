import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// 1. Blindaje de Payload (Zod Strict)
const progressSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  completed: z.boolean(),
}).strict();

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!session || !courseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await prisma.progress.findMany({
      where: {
        userId: session.userId,
        courseId,
        completed: true,
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Validar Sesión
    const session = await getSession();
    if (!session || (session.role !== 'STUDENT' && session.role !== 'ADMIN' && session.role !== 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validar Payload (Zod)
    const body = await req.json();
    const validation = progressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Payload inválido', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { courseId, lessonId, completed } = validation.data;

    // 3. Integrity Guard (Universal para todos los roles)
    // Validamos que la lección realmente pertenezca al curso indicado para evitar datos corruptos.
    const lessonBelongsToCourse = await prisma.courseLesson.findFirst({
      where: { 
        id: lessonId, 
        courseId: courseId 
      },
      select: { id: true }
    });

    if (!lessonBelongsToCourse) {
      return NextResponse.json({ 
        error: 'Integridad fallida: La lección no pertenece al curso especificado' 
      }, { status: 403 });
    }

    // 4. Obtener información del curso (Necesaria para el cap de 100%)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { lessons: true } } }
    });

    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    // 5. Enrollment Guard (Solo para STUDENT y ADMIN)
    if (session.role === 'STUDENT' || session.role === 'ADMIN') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.userId,
            courseId: courseId
          }
        }
      });

      // Solo se permite progreso si la inscripción está ACTIVE o COMPLETED
      if (!enrollment || (enrollment.status !== 'ACTIVE' && enrollment.status !== 'COMPLETED')) {
        return NextResponse.json({ 
          error: 'Acceso denegado: Se requiere una inscripción activa para registrar progreso' 
        }, { status: 403 });
      }
    }

    // 6. Ownership/Enrollment Guard (Solo para INSTRUCTOR)
    if (session.role === 'INSTRUCTOR') {
       const isOwner = course.instructorId === session.userId;
       const enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.userId, courseId } }
       });

       if (!isOwner && !enrollment) {
          return NextResponse.json({ 
            error: 'Acceso denegado: Como instructor, debes ser dueño del curso o estar inscrito para registrar progreso' 
          }, { status: 403 });
       }
    }

    // 7. Lógica de Persistencia (Upsert)
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId,
        }
      }
    });

    // Evitar re-procesar si ya está completada
    if (existingProgress?.completed && !!completed) {
       return NextResponse.json(existingProgress);
    }
    
    // Calcular porcentaje para el cap de seguridad
    const completedCount = await prisma.progress.count({
      where: { 
        userId: session.userId, 
        courseId, 
        completed: true,
        NOT: { lessonId } 
      }
    });

    const totalLessons = course._count.lessons || 0;

    if (completed && completedCount >= totalLessons) {
        return NextResponse.json({ error: 'Progreso máximo alcanzado (100%)' }, { status: 400 });
    }

    const record = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId,
        }
      },
      update: {
        completed: !!completed,
        completedAt: completed ? (existingProgress?.completedAt || new Date()) : null,
      },
      create: {
        userId: session.userId,
        courseId,
        lessonId,
        completed: !!completed,
        completedAt: completed ? new Date() : null,
      }
    });

    // --- LÓGICA DE DIPLOMA AUTOMÁTICO (Fase de Graduación) ---
    if (completed) {
      const finalCompletedCount = await prisma.progress.count({
        where: { userId: session.userId, courseId, completed: true }
      });

      if (finalCompletedCount >= totalLessons) {
        // 1. Marcar Inscripción como COMPLETED
        await prisma.enrollment.update({
          where: { userId_courseId: { userId: session.userId, courseId } },
          data: { status: 'COMPLETED' }
        });

        // 2. Generar Certificado si no existe
        const existingCert = await prisma.certification.findUnique({
          where: { userId_courseId: { userId: session.userId, courseId } }
        });

        if (!existingCert) {
          const { sendCertificateEmail } = await import('@/lib/mail');
          const certificateCode = `CERT-${courseId.substring(0,4).toUpperCase()}-${session.userId.substring(0,4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
          
          await prisma.certification.create({
            data: {
              userId: session.userId,
              courseId,
              certificateCode,
              issuedAt: new Date()
            }
          });

          // 3. Enviar Correo
          const user = await prisma.user.findUnique({ where: { id: session.userId } });
          const url = (process.env.NODE_ENV === 'production' ? 'https://www.plattform.mx' : (process.env.NEXTAUTH_URL || 'http://localhost:3001')).replace(/\/$/, '');
          
          if (user) {
            try {
              await sendCertificateEmail(
                user.email, 
                user.name, 
                course.title, 
                `${url}/dashboard/student/certificates`
              );
            } catch (mailError) {
              console.error('Error sending certificate email:', mailError);
            }
          }
        }
      }
    }

    return NextResponse.json(record);

  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO EN /student/progress:', error.message);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}

