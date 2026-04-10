import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.id;
    const whereClause: any = { id: courseId };
    if (session.role !== 'ADMIN') {
        whereClause.instructorId = session.userId;
    }

    const course = await prisma.course.findUnique({
      where: whereClause,
      include: {
        modules: { include: { lessons: true } }
      }
    });

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    // Validations
    const errors: string[] = [];
    if (!course.title || course.title.length < 5) errors.push('Título muy corto o inexistente');
    if (!course.description || course.description.length < 20) errors.push('La descripción debe ser más detallada');
    if (Number(course.price) <= 0) errors.push('El precio debe ser mayor a 0');
    if (course.modules.length === 0) errors.push('El curso debe tener al menos un módulo');
    
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalLessons === 0) errors.push('El curso debe tener al menos una lección');

    // Subscription check for Instructors
    if (session.role === 'INSTRUCTOR') {
        const sub = await prisma.instructorSubscription.findFirst({
            where: { 
                instructor: { userId: session.userId },
                status: 'ACTIVE'
            }
        });
        if (!sub) {
            errors.push('Debes tener una suscripción activa para publicar cursos. Ve a Configuración > Plan.');
        }
    }

    if (errors.length > 0) {
        return NextResponse.json({ error: 'Validación fallida', details: errors }, { status: 400 });
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
