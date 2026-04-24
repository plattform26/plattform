import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json({ error: 'Email not verified. Please check your inbox.' }, { status: 403 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = crypto.randomUUID(); // Simplest robust refresh token

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Save refresh token to sessions table
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
        userAgent: req.headers.get('user-agent') || 'Unknown',
        ipAddress: req.headers.get('x-forwarded-for') || 'Unknown IP',
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set Cookies
    const cookieStore = await cookies();
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json({
      message: 'Login successful',
      role: user.role,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
