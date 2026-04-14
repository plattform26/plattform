import { NextResponse } from 'next/server';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

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
