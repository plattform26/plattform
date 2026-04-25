import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { adminManualEnrollmentSchema } from '@/lib/validations/admin';

/**
 * POST /api/admin/enrollments/manual
 * Inscribe a un alumno manualmente.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = adminManualEnrollmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { email, name, lastName, courseId, reason, notes } = validation.data;

    // 1. Buscar o Crear Alumno
    let student = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;
    
    if (!student) {
      isNewUser = true;
      const passwordHash = await bcrypt.hash('Plattform2025', 12);
      student = await prisma.user.create({
        data: {
          email,
          name: name || 'Alumno',
          lastName: lastName || 'Manual',
          passwordHash,
          role: 'STUDENT',
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
        }
      });
    }

    // 2. Crear Enrollment (AccessType: MANUAL)
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: student.id, courseId }
      },
      update: {
        status: 'ACTIVE',
        accessType: 'MANUAL'
      },
      create: {
        userId: student.id,
        courseId,
        status: 'ACTIVE',
        accessType: 'MANUAL'
      }
    });

    // 3. Registrar en AdminManualEnrollment para historial/auditoría
    // Añadimos una nota si el usuario fue creado en el proceso
    const auditNotes = isNewUser 
      ? `[AUTO-CREATED USER] ${notes || ''}`.trim()
      : notes;

    await prisma.adminManualEnrollment.create({
      data: {
        adminId: session.userId,
        studentId: student.id,
        courseId,
        reason,
        notes: auditNotes
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: isNewUser 
        ? `Usuario creado e inscrito: ${student.email}`
        : `Inscripción exitosa para ${student.email}`,
      enrollment 
    });

  } catch (error: any) {
    console.error('Error in manual enrollment:', error);
    if (error.code === 'P2002') {
       return NextResponse.json({ error: 'El usuario ya tiene este curso o hay un conflicto de datos.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno al procesar inscripción manual' }, { status: 500 });
  }
}

/**
 * GET /api/admin/enrollments/manual
 * Lista historial de inscripciones manuales.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const history = await prisma.adminManualEnrollment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, lastName: true, email: true } },
        course: { select: { title: true } },
        admin: { select: { name: true } }
      }
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
  }
}
