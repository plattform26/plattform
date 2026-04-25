import { NextResponse } from 'next/server';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';

import { forgotPasswordSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { email } = validation.data;

    const token = await generatePasswordResetToken(email);

    if (!token) {
      // Return 200 to prevent email enumeration
      return NextResponse.json({ message: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
    }

    // Misión: Detección de Origen para Emails Inteligentes
    const origin = req.headers.get('origin') || req.headers.get('referer') || process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const baseUrl = new URL(origin).origin;

    await sendPasswordResetEmail(email, token.token, baseUrl);

    return NextResponse.json({ message: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
