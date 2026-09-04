import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * middleware.ts
 * Protección perimetral de rutas administrativas (Hito 10).
 * Redirige accesos no autenticados a /admin/login preservando el destino original.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplicar a rutas bajo /admin, exceptuando la propia pantalla de login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const allCookies = request.cookies.getAll();
    const hasAuth = allCookies.some(
      (c) =>
        c.name === 'admin-session' ||
        c.name.includes('sb-') ||
        c.name.includes('supabase')
    );

    // Si Supabase está en producción o si no hay ninguna sesión activa
    if (!hasAuth && process.env.NODE_ENV === 'production') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
