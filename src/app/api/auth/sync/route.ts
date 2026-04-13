import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

/**
 * Misión: Sincronización de Sesión (Session Update)
 * Este endpoint permite re-generar los tokens de acceso basándose en el estado actual de la DB.
 * Útil tras verificar el email o cambiar el estatus del usuario.
 */
export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const currentToken = cookieStore.get('accessToken')?.value;

    if (!currentToken) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const decoded = verifyToken(currentToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        lastName: true,
        status: true,
        emailVerifiedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generar nuevos tokens con info fresca de la DB
    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name || '',
      lastName: user.lastName || '',
    };

    const newAccessToken = signAccessToken(payload);

    // Actualizar Cookie
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });

    return NextResponse.json({ 
      message: 'Session synchronized with database',
      user: {
        ...payload,
        isEmailVerified: !!user.emailVerifiedAt,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Sync session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
