import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        instructor: {
          select: {
            name: true,
            lastName: true,
          }
        },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        quizzes: {
          include: {
            questions: { 
              include: { options: { orderBy: { orderIndex: 'asc' } } },
              orderBy: { orderIndex: 'asc' } 
            }
          }
        },
      },
    });

    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Reglas de acceso
    if (session.role === 'ADMIN') {
        // El ADMIN siempre puede ver cualquier curso
        return NextResponse.json(course);
    }

    // Si es estudiante, solo devolvemos si el curso es público o está publicado
    if (session.role === 'STUDENT' && course.status !== 'PUBLISHED') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Si es instructor, solo si es su propio curso
    if (session.role === 'INSTRUCTOR' && course.instructorId !== session.userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const where: any = { id: params.id, deletedAt: null };
    if (session.role !== 'ADMIN') {
        where.instructorId = session.userId;
    }

    const course = await prisma.course.findUnique({ 
      where,
      include: { _count: { select: { enrollments: true } } }
    });
    
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Lógica de Bloqueo de Edición (Edit Lock) - Solo aplica para INSTRUCTORES
    const hasEnrollments = course._count.enrollments > 0;
    const isActive = course.status === 'PUBLISHED' || course.status === 'HIBERNATED';
    const isInstructor = session.role === 'INSTRUCTOR';
    
    // Si es instructor, tiene alumnos y está publicado/hibernado, bloqueamos cambios en el contenido base
    if (isInstructor && hasEnrollments && isActive) {
        // Campos prohibidos si hay alumnos
        const restrictedFields = ['title', 'description', 'price', 'category', 'level', 'durationHours', 'thumbnailUrl'];
        const attemptingRestricted = Object.keys(body).some(key => restrictedFields.includes(key) && body[key] !== undefined);
        
        if (attemptingRestricted) {
           return NextResponse.json({ 
             error: 'CURSO_BLOQUEADO', 
             message: 'Este curso tiene alumnos activos y no puedes editarlo para proteger la integridad del contenido. Contacta al soporte si necesitas realizar cambios críticos.' 
           }, { status: 403 });
        }
    }

    const updated = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        category: body.category !== undefined ? body.category : undefined,
        level: body.level !== undefined ? body.level : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        durationHours: body.durationHours !== undefined ? Number(body.durationHours) : undefined,
        thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : undefined,
        previewText: body.previewText !== undefined ? body.previewText : undefined,
        visibility: body.visibility !== undefined ? body.visibility : undefined,
        status: body.status !== undefined ? body.status : undefined, // Permitir cambio de estado (Hibernar)
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where: any = { id: params.id };
    if (session.role !== 'ADMIN') {
        where.instructorId = session.userId;
    }

    const course = await prisma.course.findUnique({ 
      where,
      include: { _count: { select: { enrollments: true } } }
    });

    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Bloqueo de Eliminación: El administrador puede borrar todo. 
    // Los instructores solo pueden borrar si el curso tiene 0 alumnos (limpieza de pruebas).
    if (session.role === 'INSTRUCTOR' && course._count.enrollments > 0) {
       return NextResponse.json({ 
         error: 'ELIMINACION_PROHIBIDA',
         message: 'No puedes eliminar un curso que ya tiene alumnos inscritos. Contacta al soporte para gestionar la baja del contenido.'
       }, { status: 403 });
    }

    // Misión 2: Función 'Hard Delete' para Borradores
    // Condición: Estado DRAFT y 0 alumnos.
    const isDraft = course.status === 'DRAFT' && !course.publishedAt;
    const hasStudents = course._count.enrollments > 0;

    // Bitácora Técnica Minimalista (Solicitada)
    const logLine = `[${new Date().toISOString()}] - Curso ID [${params.id}] eliminado por Instructor [${session.userId}] (Motivo: Borrado de Borrador)`;
    console.log('TECHNICAL_LOG:', logLine);

    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        action: isDraft ? 'HARD_DELETE_DRAFT' : 'SOFT_DELETE_COURSE',
        entityType: 'COURSE',
        entityId: params.id,
        metadataJson: { 
          logEntry: logLine,
          reason: isDraft ? 'Eliminación de Borrador' : 'Gestión de Contenido',
          title: course.title
        }
      }
    });

    if (isDraft && !hasStudents) {
      // Borrado Total (Cascade se encarga de todo lo relacionado)
      await prisma.course.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true, mode: 'hard', message: 'Curso eliminado definitivamente.' });
    } else {
      // Soft Delete (Protección de integridad)
      await prisma.course.update({
        where: { id: params.id },
        data: { deletedAt: new Date() }
      });
      return NextResponse.json({ success: true, mode: 'soft', message: 'Curso movido a la papelera.' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
