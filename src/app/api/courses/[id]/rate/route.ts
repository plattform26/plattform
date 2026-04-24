import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Solo los alumnos pueden calificar cursos' }, { status: 401 });
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe estar entre 1 y 5' }, { status: 400 });
    }

    // 1. Validar que el alumno tenga acceso al curso y lo haya completado o tenga certificado
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: params.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 });
    }

    // Comprobar si tiene certificado
    const certification = await prisma.certification.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: params.id,
        },
      },
    });

    // Según el prompt: "Validar que el alumno haya completado el curso o desbloqueado el certificado"
    if (enrollment.status !== 'COMPLETED' && !certification) {
      return NextResponse.json({ error: 'Debes finalizar el curso para poder calificarlo' }, { status: 403 });
    }

    // 2. Obtener el instructorId del curso
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: { instructorId: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    // 3. Upsert de la calificación (Asegura que solo califique una vez, pero permite actualizar)
    const ratingRecord = await prisma.courseRating.upsert({
      where: {
        courseId_userId: {
          courseId: params.id,
          userId: session.userId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        courseId: params.id,
        userId: session.userId,
        instructorId: course.instructorId,
        rating,
        comment,
      },
    });

    return NextResponse.json({ message: 'Calificación guardada correctamente', rating: ratingRecord });
  } catch (error: any) {
    console.error('Error in POST /api/courses/[id]/rate:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
  }
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    
    const ratings = await prisma.courseRating.findMany({
      where: { courseId: params.id },
      include: {
        student: {
          select: { name: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const averageRaw = await prisma.courseRating.aggregate({
      where: { courseId: params.id },
      _avg: { rating: true },
      _count: { id: true }
    });

    // Buscar si el usuario actual ya calificó
    const myRating = session ? ratings.find(r => r.userId === session.userId) : null;

    // Buscar datos básicos del curso e instructor para el modal
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: { 
        title: true, 
        instructor: { select: { name: true } } 
      }
    });

    return NextResponse.json({
      ratings,
      myRating,
      average: averageRaw._avg.rating || 0,
      count: averageRaw._count.id,
      courseMeta: {
        title: course?.title,
        instructorName: course?.instructor?.name
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener calificaciones' }, { status: 500 });
  }
}
