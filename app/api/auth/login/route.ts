import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * Autenticación local simple con usuario/contraseña fijos.
 * Emite una cookie `admin-session` HttpOnly para proteger el panel.
 */
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const LOCAL_USER = process.env.LOCAL_ADMIN_USER || 'admin';
  const LOCAL_PASS = process.env.LOCAL_ADMIN_PASS || '1234';

  if (username !== LOCAL_USER || password !== LOCAL_PASS) {
    return NextResponse.json(
      { success: false, error: 'Usuario o contraseña incorrectos.' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin-session', 'local-auth', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  });
  return response;
}
