import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * proxy.ts
 * Las rutas públicas (invitación, confirmación, etc.) no requieren inicio de sesión.
 * Solo las rutas administrativas (/admin/*) requieren la cookie `admin-session`, excepto:
 *  - /admin/login  (pantalla de login)
 *  - /api/auth/*   (endpoints de login/logout)
 */
export function proxy(request: NextRequest) {
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

  // Verificar sesión administrativa
  const allCookies = request.cookies.getAll();
  const hasAuth = allCookies.some(
    (c) =>
      c.name === 'admin-session' ||
      c.name.includes('sb-') ||
      c.name.includes('supabase')
  );

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
