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
          const data = await resRefresh.json();
          if (data.user) {
             return NextResponse.json({
               authenticated: true,
               userId: data.user.id,
               name: data.user.name,
               lastName: data.user.lastName,
               role: data.user.role,
               status: data.user.status,
               email: data.user.email,
               hasActiveSubscription: data.hasActiveSubscription || false,
               academySlug: data.academySlug || ''
             });
          }
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
        email: true,
        status: true,
        emailVerifiedAt: true,
        isCourtesy: true,
        courtesyPlanId: true
      }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Verificar suscripción si es INSTRUCTOR
    let hasActiveSubscription = false;
    let academySlug = '';
    let activePlanName = '';
    let activePlanExpiresAt = null;
    let isPlanPaused = false;
    let pausedRemainingDays: number | null = null;
    
    let capacity: any = null;
    
    if (user.role === 'INSTRUCTOR') {
      try {
        const { getEffectivePlan } = await import('@/lib/plan-utils');
        const { getUserCapacity } = await import('@/lib/utils/user-capacity');
        
        const plan = await getEffectivePlan(user.id);
        capacity = await getUserCapacity(user.id);
        
        activePlanName = plan?.displayName || 'SIN PLAN';
        activePlanExpiresAt = plan?.expiresAt || null;
        isPlanPaused = false; // No longer used
        hasActiveSubscription = !!plan; 
        
        const profile = await prisma.instructorProfile.findUnique({
          where: { userId: user.id },
          select: { slug: true }
        });
        academySlug = profile?.slug || '';
      } catch (innerError) {
        console.error('Non-critical: Error fetching instructor plan details:', innerError);
        activePlanName = 'STARTER';
        hasActiveSubscription = true;
      }
    }

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      name: user.name,
      lastName: user.lastName,
      role: user.role, // Primer nivel para el middleware
      status: user.status,
      email: user.email,
      isEmailVerified: !!user.emailVerifiedAt,
      hasActiveSubscription, // Requerido por el middleware
      isCourtesy: user.isCourtesy,
      courtesyPlanId: user.courtesyPlanId,
      activePlanName,
      activePlanExpiresAt,
      capacity, // <--- Nueva data de límites
      isPlanPaused,
      academySlug
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
