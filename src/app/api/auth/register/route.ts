import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail, sendInstructorRegistrationNoticeToAdmin, sendStudentRegistrationNoticeToAdmin } from '@/lib/mail';

// Esquema de validación estricto para prevenir inyecciones de campos
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100).optional(),
  birthDate: z.coerce.date().optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR']),
  academyName: z.string().max(200).optional(),
}).strict();

/**
 * Determina la URL base de forma segura priorizando variables de entorno.
 * Lanza un error si no se puede determinar, evitando fallos posteriores en el envío de emails.
 */
function getBaseUrl(req: Request): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    req.headers.get('origin'),
    req.headers.get('referer'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      return new URL(candidate).origin;
    } catch {
      continue;
    }
  }
  
  throw new Error('No se pudo determinar la URL base de la aplicación. Configura NEXT_PUBLIC_APP_URL.');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validación de Esquema (Zod Strict) - Falla rápido
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos de registro inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { name, lastName, birthDate, email, password, role, academyName } = validation.data;

    // 2. Control de Roles (Defensa en profundidad)
    if (role !== 'STUDENT' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Registro no permitido para este tipo de cuenta' }, { status: 403 });
    }

    // 3. Validación de URL Base - Falla ANTES de crear el usuario en la DB
    let baseUrl: string;
    try {
      baseUrl = getBaseUrl(req);
    } catch (urlError: any) {
      console.error('Configuration Error:', urlError.message);
      return NextResponse.json({ error: 'Error de configuración del servidor (URL)' }, { status: 500 });
    }

    // 4. Verificación de existencia previa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Asignación de Estado según Rol
    const initialStatus = role === 'INSTRUCTOR' ? 'PENDING_APPROVAL' : 'ACTIVE';

    // 6. Creación Atómica del Usuario (Ya validado todo lo anterior)
    const user = await prisma.user.create({
      data: {
        name,
        lastName: lastName || '',
        email,
        passwordHash,
        role,
        birthDate: birthDate || null,
        status: initialStatus,
      },
    });

    // 7. Generar Token de Verificación
    const verificationToken = await generateVerificationToken(user.email);
    
    if (role === 'STUDENT') {
      await sendVerificationEmail(user.email, verificationToken.token, baseUrl);
      await sendStudentRegistrationNoticeToAdmin(`${name} ${lastName}`, user.email, baseUrl);

      return NextResponse.json({
        message: 'Student registered successfully. Please verify your email.',
        redirectUrl: '/auth/verify-email',
        userId: user.id
      });
    }

    if (role === 'INSTRUCTOR') {
      const adminEmail = process.env.ADMIN_EMAIL || 'soporte@plattform.mx';
      if (user.email !== adminEmail) {
        await sendInstructorRegistrationNoticeToAdmin(`${name} ${lastName}`, user.id, baseUrl);
      }

      // Crear Perfil de Instructor
      const slugBase = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
      
      try {
        await prisma.instructorProfile.create({
          data: {
            userId: user.id,
            academyName: academyName || `${user.name} Academy`,
            slug: `${slugBase}-${user.id.substring(0, 5)}`,
            commissionRate: 15,
          },
        });
      } catch (profileError: any) {
        console.error('Profile creation error during register:', profileError);
      }

      await sendVerificationEmail(user.email, verificationToken.token, baseUrl);

      return NextResponse.json({
        message: 'Instructor registered successfully. Please verify your email.',
        redirectUrl: '/auth/verify-email',
        userId: user.id
      });
    }

    return NextResponse.json({ error: 'Operación no permitida' }, { status: 400 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

