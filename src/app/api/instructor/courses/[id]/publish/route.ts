import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscamos el curso con toda su estructura para validar
    const course = await prisma.course.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        modules: {
          include: { lessons: true }
        },
        quizzes: {
          include: { questions: true }
        }
      }
    });

    if (!course) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });

    // 1. Validación de Estructura (Módulos y Lecciones)
    if (course.modules.length === 0) {
      return NextResponse.json({ error: 'Faltante: El curso debe tener al menos un módulo.' }, { status: 400 });
    }

    const modulesWithoutLessons = course.modules.filter(m => m.lessons.length === 0);
    if (modulesWithoutLessons.length > 0) {
      return NextResponse.json({ 
        error: `Faltante: El módulo "${modulesWithoutLessons[0].title}" no tiene lecciones.` 
      }, { status: 400 });
    }

    // 2. Validación de Evaluación (Examen Final)
    if (!course.hasQuiz) {
      return NextResponse.json({ 
        error: 'Faltante: No puedes publicar sin un examen final configurado. Por favor, crea y guarda el examen en el constructor.' 
      }, { status: 400 });
    }

    // 3. Validación de Metadatos Críticos
    if (!course.title || !course.description || !course.category) {
        return NextResponse.json({ 
            error: 'Faltante: Asegúrate de configurar el título, descripción y categoría antes de publicar.' 
        }, { status: 400 });
    }

    const updated = await prisma.course.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        publishedAt: new Date(),
      }
    });

    return NextResponse.json({
        success: true,
        message: '¡Curso publicado con éxito!',
        course: updated
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Error interno al publicar el curso' }, { status: 500 });
  }
}
