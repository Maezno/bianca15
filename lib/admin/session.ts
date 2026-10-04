/**
 * lib/admin/session.ts
 * Sesión administrativa firmada con HMAC-SHA256 (Web Crypto: funciona en proxy y en Node).
 * Formato del token: `<expiraciónMs>.<nonce>.<firmaHex>`
 * Sin SESSION_SECRET en producción, no se emiten ni aceptan sesiones.
 */

export const SESSION_COOKIE = 'admin-session';
export const SESSION_MAX_AGE_S = 60 * 60 * 8; // 8 horas

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-insecure-secret-change-me-0000';
  return null;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_MAX_AGE_S * 1000;
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer);
  const payload = `${exp}.${nonce}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(`${exp}.${nonce}`, secret));
}
