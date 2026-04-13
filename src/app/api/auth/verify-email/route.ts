import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVerificationTokenByToken } from '@/lib/tokens';
import { sendWelcomeEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const verificationToken = await getVerificationTokenByToken(token);
    
    if (!verificationToken) {
      return NextResponse.json({ error: 'Token inválido o inexistente' }, { status: 400 });
    }

    const hasExpired = new Date(verificationToken.expiresAt) < new Date();
    if (hasExpired) {
      return NextResponse.json({ error: 'El token ha expirado. Por favor solicita uno nuevo.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si el usuario ya está verificado, limpiamos el token (si existe) y retornamos éxito
    if (user.emailVerifiedAt) {
      // Usamos deleteMany para no fallar si el token ya fue borrado por otra petición paralela
      await prisma.verificationToken.deleteMany({
        where: { id: verificationToken.id }
      });
      return NextResponse.json({ message: 'Email ya verificado' }, { status: 200 });
    }

    // Proceso de verificación atómico
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.verificationToken.deleteMany({
        where: { id: verificationToken.id }
      })
    ]);

    // Send Welcome Email
    await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json({ message: 'Email verificado con éxito' });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
