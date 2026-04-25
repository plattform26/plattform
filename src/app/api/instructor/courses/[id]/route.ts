import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isCourseLocked } from '@/lib/course-protection';
import { updateCourseSchema } from '@/lib/validations/courses';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
            instructorProfile: {
              include: {
                subscriptions: {
                  where: { status: 'ACTIVE' },
                  include: { plan: true },
                  take: 1
                }
              }
            }
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

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyRaw = await req.json();
    const validation = updateCourseSchema.safeParse(bodyRaw);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const body = validation.data;

    const where: any = { id: params.id, deletedAt: null };
    if (session.role !== 'ADMIN') {
        where.instructorId = session.userId;
    }

    const course = await prisma.course.findUnique({ 
      where,
      include: { _count: { select: { enrollments: true } } }
    });
    
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Lógica de Bloqueo de Edición (Seguridad en Producción)
    const lock = await isCourseLocked(params.id, session.role);
    if (lock.locked) {
      return NextResponse.json({ 
        error: 'CURSO_BLOQUEADO', 
        message: lock.reason 
      }, { status: 403 });
    }

    // Misión: Hardening de Candados (Seguridad en Servidor)
    if (session.role === 'INSTRUCTOR' && body.status === 'PUBLISHED') {
      const instructorUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { status: true }
      });
      
      if (instructorUser?.status !== 'ACTIVE') {
        return NextResponse.json({ 
          error: 'ACCION_RESTRINGIDA', 
          message: 'Tu cuenta requiere aprobación administrativa para publicar cursos.' 
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

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    // Bloqueo de Eliminación (Seguridad en Producción)
    const lock = await isCourseLocked(params.id, session.role);
    if (lock.locked) {
       return NextResponse.json({ 
         error: 'ELIMINACION_PROHIBIDA',
         message: lock.reason
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
