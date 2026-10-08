import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Elimina la cookie de sesión y redirige al login.
 */
export async function POST(_request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      const { createClient } = await import('@/utils/supabase/server');
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('Logout error:', err);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  const requestCookies = _request.cookies.getAll();
  for (const c of requestCookies) {
    if (c.name.startsWith('sb-')) {
      response.cookies.set(c.name, '', {
        path: '/',
        maxAge: 0,
      });
    }
  }

  return response;
}
