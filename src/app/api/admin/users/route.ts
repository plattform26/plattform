import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mail';
import { adminCreateUserSchema } from '@/lib/validations/admin';

/**
 * GET /api/admin/users
 * Lista usuarios con filtro por rol, búsqueda y actividad real.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role'); // STUDENT, INSTRUCTOR, null (all)
  const query = searchParams.get('q');
  const status = searchParams.get('status');

  try {
    const where: any = {};
    if (role && role !== 'ALL') where.role = role;
    if (status) where.status = status;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        instructorProfile: true, 
        _count: {
          select: { courses: true, enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const cleanUsers = await Promise.all(users.map(async u => {
      let capacity: any = null;

      const { getEffectivePlan } = await import('@/lib/plan-utils');
      const plan = await getEffectivePlan(u.id);

      if (plan) {
        activePlanName = plan.displayName;
        if (plan.status === 'COURTESY') {
          planOrigin = 'CORTESÍA';
          planKeyLabel = 'Desde';
          planKeyDate = u.createdAt.toISOString();
        } else {
          planOrigin = 'PAGO_STRIPE';
          planKeyLabel = 'Vence';
          planKeyDate = plan.expiresAt ? plan.expiresAt.toISOString() : null;
        }

        if (u.role === 'INSTRUCTOR') {
          const { getUserCapacity } = await import('@/lib/utils/user-capacity');
          capacity = await getUserCapacity(u.id);
        }
      }

      return {
        id: u.id,
        name: u.name,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        status: u.status,
        isCourtesy: u.isCourtesy,
        courtesyPlanId: u.courtesyPlanId,
        activePlanName,
        planOrigin,
        planKeyLabel,
        planKeyDate,
        capacity, // <--- Nueva data para Diego
        specialty: u.instructorProfile?.specialty || 'N/A',
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
        _count: {
          courses: u._count?.courses || 0,
          enrollments: u._count?.enrollments || 0
        }
      };
    }));

    return NextResponse.json(cleanUsers);
  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO EN LISTA ADMIN:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Misión: Expansión Administrativa v7.0 - Creación Manual de Usuarios
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = adminCreateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { name, lastName, email, password, role } = validation.data;

    // Identificar si ya existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Si es ADMIN, se crea verificado. Si no, pendiente de verificación.
    const isVerified = role === 'ADMIN';
    const emailVerifiedAt = isVerified ? new Date() : null;

    const user = await prisma.user.create({
      data: {
        name,
        lastName: lastName || '',
        email,
        passwordHash,
        role,
        status: 'ACTIVE',
        emailVerifiedAt,
      }
    });

    // Si no es admin, enviamos correo de verificación
    if (!isVerified) {
      const tokenValue = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verificationToken.create({
        data: {
          email: user.email,
          token: tokenValue,
          expiresAt,
        }
      });

      await sendVerificationEmail(user.email, tokenValue);
    }

    return NextResponse.json({ 
      id: user.id, 
      message: isVerified ? 'Usuario creado y verificado' : 'Usuario creado. Correo de verificación enviado.' 
    });

  } catch (error: any) {
    console.error('❌ ERROR AL CREAR USUARIO:', error.message);
    return NextResponse.json({ error: 'Error al crear usuario', details: error.message }, { status: 500 });
  }
}

