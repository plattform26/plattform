import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signAccessToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.revokedAt || new Date() > session.expiresAt) {
      // Clear cookies if invalid
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    if (session.user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'User is suspended' }, { status: 403 });
    }

    // Generate new access token
    const newAccessToken = signAccessToken({
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email,
      name: session.user.name || '',
      lastName: session.user.lastName || '',
    });

    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });

    return NextResponse.json({ message: 'Token refreshed successfully' });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
