import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return 200 to prevent email enumeration
      return NextResponse.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 mins expiration

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: token,
        expiresAt: expiresAt,
      },
    });

    sendPasswordResetEmail(user.email, token, user.name);

    return NextResponse.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
