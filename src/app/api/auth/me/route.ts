export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    let session = await getSession();
    
    // SHIELD: Silent Refresh Logic
    if (!session) {
      const cookieStore = require('next/headers').cookies();
      const refreshToken = cookieStore.get('refreshToken')?.value;
      
      if (refreshToken) {
        console.log('DEBUG: AccessToken expired, attempting silent refresh...');
        const resRefresh = await fetch(`${new URL(req.url).origin}/api/auth/refresh`, {
          method: 'POST',
          headers: { cookie: `refreshToken=${refreshToken}` }
        });
        
        if (resRefresh.ok) {
          console.log('DEBUG: Silent refresh successful');
          session = await getSession(); // Intentar obtener sesiÃ³n de nuevo con el nuevo cookie
        }
      }
    }

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { 
        id: true, 
        name: true, 
        lastName: true, 
        role: true, 
        email: true 
      }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Verificar suscripciÃ³n si es INSTRUCTOR
    let hasActiveSubscription = false;
    let academySlug = '';
    
    if (user.role === 'INSTRUCTOR') {
      const profile = await prisma.instructorProfile.findUnique({
        where: { userId: user.id },
        include: { 
          subscriptions: { 
            where: { status: 'ACTIVE' },
            take: 1
          } 
        }
      });
      hasActiveSubscription = (profile?.subscriptions?.length || 0) > 0;
      academySlug = profile?.slug || '';
    }

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      name: user.name,
      lastName: user.lastName,
      role: user.role, // Primer nivel para el middleware
      email: user.email,
      hasActiveSubscription, // Requerido por el middleware
      academySlug
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

