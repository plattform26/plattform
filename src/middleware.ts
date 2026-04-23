import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/courses', '/support'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith('/api') || 
      PUBLIC_PATHS.includes(pathname) || 
      pathname.startsWith('/courses/')) {
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

      if (!isEmailVerified && pathname !== '/auth/verify-email') {
        return NextResponse.redirect(new URL('/auth/verify-email', req.url));
      }

      if (pathname === '/dashboard') {
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard/admin', req.url));
        if (role === 'INSTRUCTOR') {
          if (!hasActiveSubscription) return NextResponse.redirect(new URL('/dashboard/instructor/plan', req.url));
          return NextResponse.redirect(new URL('/dashboard/instructor', req.url));
        }
        if (role === 'STUDENT') return NextResponse.redirect(new URL('/dashboard/student', req.url));
      }

      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
