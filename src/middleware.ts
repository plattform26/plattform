import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register', '/auth/verify-email', '/verify-email', '/forgot-password', '/reset-password', '/courses'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Bypass para TODAS las rutas de API
  // Las APIs manejan su propia autenticación con getSession() en lib/auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.includes(pathname);
  if (isPublicPath) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard')) {
    const authUrl = `${req.nextUrl.origin}/api/auth/me`;
    try {
      const res = await fetch(authUrl, {
        method: 'GET',
        headers: { cookie: req.headers.get('cookie') || '' }
      });
      
      const auth = await res.json();
      
      if (!auth.authenticated) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      const { role, hasActiveSubscription, isEmailVerified } = auth;

      // Misión: Blindaje de Acceso - Bloqueo de Dashboard si no está verificado
      const isVerificationNotice = pathname === '/auth/verify-email';
      const isNewVerification = pathname === '/auth/new-verification';
      
      if (!isEmailVerified && !isVerificationNotice && !isNewVerification) {
        return NextResponse.redirect(new URL('/auth/verify-email', req.url));
      }

      // 1. Redirección inteligente para la raíz '/dashboard'
      if (pathname === '/dashboard') {
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard/admin', req.url));
        
        if (role === 'INSTRUCTOR') {
          if (!hasActiveSubscription) return NextResponse.redirect(new URL('/dashboard/instructor/plan', req.url));
          return NextResponse.redirect(new URL('/dashboard/instructor', req.url));
        }

        if (role === 'STUDENT') return NextResponse.redirect(new URL('/dashboard/student', req.url));
        
        return NextResponse.redirect(new URL('/login', req.url));
      }

      const isPreview = req.nextUrl.searchParams.get('preview') === 'true';

      // 2. Seguridad por rutas específicas
      if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      if (pathname.startsWith('/dashboard/instructor')) {
        // Permitir que tanto INSTRUCTOR como ADMIN accedan a estas rutas
        if (role !== 'INSTRUCTOR' && role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        
        // El bypass de suscripción aplica para ADMIN. Los instructores siguen necesitando plan activo.
        // Solo redirigir a /plan si NO estamos ya en esa ruta para evitar bucles.
        const isPlanPage = pathname === '/dashboard/instructor/plan';
        if (role === 'INSTRUCTOR' && !hasActiveSubscription && !isPlanPage) {
          return NextResponse.redirect(new URL('/dashboard/instructor/plan', req.url));
        }
      }

      if (pathname.startsWith('/dashboard/student')) {
        // PERMITIR: Estudiantes, Instructores y Admins pueden entrar a la zona de estudio.
        const isAllowedRole = role === 'STUDENT' || role === 'INSTRUCTOR' || role === 'ADMIN';

        if (!isAllowedRole) {
           return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }

      return NextResponse.next();
    } catch (e) {
      console.error('Middleware Auth Error:', e);
      // Solo expulsar al login si es una ruta que requiere dashboard obligatoriamente
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
