import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, safeEqual, SESSION_COOKIE, SESSION_MAX_AGE_S } from '@/lib/admin/session';

/**
 * POST /api/auth/login
 * Autenticación local con usuario/contraseña definidos por variables de entorno.
 * Emite una cookie `admin-session` HttpOnly firmada (HMAC) para proteger el panel.
 */

// Límite simple en memoria contra fuerza bruta: 5 intentos fallidos / 15 min por IP.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.until > now && rec.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos. Probá de nuevo en 15 minutos.' },
      { status: 429 }
    );
  }

  let username = '';
  let password = '';
  try {
    const body = await request.json();
    username = String(body?.username ?? '');
    password = String(body?.password ?? '');
  } catch {
    return NextResponse.json({ success: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const LOCAL_USER = process.env.LOCAL_ADMIN_USER || 'maezno';
  const LOCAL_PASS = process.env.LOCAL_ADMIN_PASS || 'vpcwy720-';

  if (!LOCAL_USER || !LOCAL_PASS) {
    return NextResponse.json(
      { success: false, error: 'El acceso administrativo no está configurado en el servidor.' },
      { status: 503 }
    );
  }

  if (!safeEqual(username, LOCAL_USER) || !safeEqual(password, LOCAL_PASS)) {
    const fresh = !rec || rec.until <= now;
    attempts.set(ip, { count: fresh ? 1 : rec!.count + 1, until: fresh ? now + WINDOW_MS : rec!.until });
    return NextResponse.json(
      { success: false, error: 'Usuario o contraseña incorrectos.' },
      { status: 401 }
    );
  }

  attempts.delete(ip);
  const token = await createSessionToken();
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Falta configurar SESSION_SECRET en el servidor.' },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_S,
    path: '/',
  });
  return response;
}
