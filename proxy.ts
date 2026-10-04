import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin/session';

/**
 * proxy.ts
 * Las rutas públicas (invitación, confirmación, etc.) no requieren inicio de sesión.
 * Solo las rutas administrativas (/admin/*) requieren la cookie `admin-session`, excepto:
 *  - /admin/login  (pantalla de login)
 *  - /api/auth/*   (endpoints de login/logout)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo las rutas /admin requieren autenticación
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Rutas administrativas públicas: login y API de autenticación
  const isPublic =
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth/');

  if (isPublic) return NextResponse.next();

  // Verificar sesión administrativa firmada
  const hasAuth = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasAuth) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Aplica únicamente a las rutas administrativas
  matcher: ['/admin/:path*'],
};
