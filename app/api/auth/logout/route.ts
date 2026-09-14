import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Elimina la cookie de sesión y redirige al login.
 */
export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
