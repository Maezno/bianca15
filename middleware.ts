import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * middleware.ts
 * La app es completamente privada.
 * Todas las rutas requieren la cookie `admin-session`, excepto:
 *  - /admin/login  (pantalla de login)
 *  - /api/auth/*   (endpoints de login/logout)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas: login y API de autenticación
  const isPublic =
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth/');

  if (isPublic) return NextResponse.next();

  // Verificar sesión
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
  // Aplica a todas las rutas excepto archivos estáticos y _next
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js)).*)',
  ],
};
