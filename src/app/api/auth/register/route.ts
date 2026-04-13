import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail, sendInstructorRegistrationNoticeToAdmin } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, lastName, birthDate, email, password, role, academyName } = body;

    if (!name || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Misión: Control de Calidad - Instructores quedan en PENDING_APPROVAL
    const initialStatus = role === 'INSTRUCTOR' ? 'PENDING_APPROVAL' : 'ACTIVE';

    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        email,
        passwordHash,
        role,
        birthDate: birthDate ? new Date(birthDate) : null,
        status: initialStatus,
      },
    });

    // Misión: Blindaje de Acceso - Generar y Guardar Token en DB
    const verificationToken = await generateVerificationToken(user.email);
    
    // Misión: Un solo email de verificación.
    let shouldSendMainVerification = true;

    if (role === 'STUDENT') {
      await sendVerificationEmail(user.email, verificationToken.token);
      return NextResponse.json({
        message: 'Student registered successfully. Please verify your email.',
        redirectUrl: '/auth/verify-email',
      });
    }

    if (role === 'INSTRUCTOR') {
      // Misión: Blindaje de Email - No enviar notificación al admin si es el mismo usuario
      const adminEmail = process.env.ADMIN_EMAIL || 'soporte@plattform.mx';
      if (user.email !== adminEmail) {
        await sendInstructorRegistrationNoticeToAdmin(`${name} ${lastName}`, user.id);
      }

      // 1. Create Instructor Profile with provided academyName or default
      const slugBase = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
      
      try {
        await prisma.instructorProfile.create({
          data: {
            userId: user.id,
            academyName: academyName || `${user.name} Academy`,
            slug: `${slugBase}-${user.id.substring(0, 5)}`,
            commissionRate: 15, // Default commission
          },
        });
      } catch (profileError: any) {
        console.error('Profile creation error during register:', profileError);
        // We continue even if profile fails (can be fixed later)
      }

      // Enviar el correo final después de todo el trabajo pesado
      await sendVerificationEmail(user.email, verificationToken.token);

      return NextResponse.json({
        message: 'Instructor registered successfully. Please verify your email.',
        redirectUrl: '/auth/verify-email',
      });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
