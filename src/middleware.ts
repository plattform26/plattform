import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from './lib/jwt-edge';

// Whitelist de API: Rutas que NO requieren sesión
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh',
  '/api/auth/verify-email',
  '/api/auth/logout',
  '/api/webhooks/stripe',
];

// Whitelist de API: Prefijos dinámicos (SOLO para GET público)
const PUBLIC_API_PREFIXES = [
  '/api/courses',
  '/api/instructor/',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Normalización de trailing slash
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  // 2. Permitir Preflight (CORS)
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // 3. Lógica de Blindaje de API (Denegación por Defecto)
  if (normalizedPath.startsWith('/api')) {
    // 3.1. Whitelist de rutas exactas
    if (PUBLIC_API_ROUTES.includes(normalizedPath)) {
      return NextResponse.next();
    }

    // 3.2. Whitelist de prefijos (Catálogo/Perfiles) SOLO si es GET
    const isPublicPrefix = PUBLIC_API_PREFIXES.some(p => normalizedPath.startsWith(p));
    if (isPublicPrefix && req.method === 'GET') {
      return NextResponse.next();
    }

    // 3.3. Protección General: Verificación Criptográfica en Edge
    const token = req.cookies.get('accessToken')?.value;
    const session = token ? await verifyTokenEdge(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión requerida' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 4. Lógica de Dashboard (Páginas con redirección)
  if (normalizedPath.startsWith('/dashboard')) {
    const authUrl = `${req.nextUrl.origin}/api/auth/me`;
    try {
      // El fetch propaga las cookies automáticamente
      const res = await fetch(authUrl, {
        headers: { cookie: req.headers.get('cookie') || '' }
      });
      
      const auth = await res.json();
      
      if (!auth.authenticated) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      const { role, hasActiveSubscription, isEmailVerified } = auth;
      
      if (!isEmailVerified && normalizedPath !== '/auth/verify-email') {
        return NextResponse.redirect(new URL('/auth/verify-email', req.url));
      }

      if (normalizedPath === '/dashboard') {
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard/admin', req.url));
        if (role === 'INSTRUCTOR') {
          if (!hasActiveSubscription) return NextResponse.redirect(new URL('/dashboard/instructor/plan', req.url));
          return NextResponse.redirect(new URL('/dashboard/instructor', req.url));
        }
        if (role === 'STUDENT') return NextResponse.redirect(new URL('/dashboard/student', req.url));
      }
    } catch (e) {
      console.error('Middleware auth check failed:', e);
      return NextResponse.redirect(new URL('/login?error=auth_check_failed', req.url));
    }
  }

  return NextResponse.next();
}

// Matcher optimizado: solo dashboard y api
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/api/:path*',
  ],
};
