import { randomBytes } from "crypto";

/**
 * Genera un token URL-safe seguro para identificar un grupo de invitados.
 *
 * Características:
 * - Aleatorio y criptográficamente seguro (crypto.randomBytes)
 * - No secuencial
 * - No contiene información personal
 * - URL-safe (base64url sin padding)
 * - Por defecto 9 bytes → 12 caracteres base64url (~72 bits de entropía)
 *   suficiente para evitar colisiones en miles de invitados
 *
 * Ejemplo de resultado: "a8Kx72Lm9Qp"
 */
export function generateToken(byteLength = 9): string {
  return randomBytes(byteLength)
    .toString("base64url") // URL-safe: reemplaza + por - y / por _
    .replace(/=/g, ""); // quita padding (base64url ya no lo incluye, pero por seguridad)
}

/**
 * Valida que un token tenga el formato correcto antes de hacer consultas.
 * Acepta caracteres URL-safe: letras, números, guión y guión bajo.
 * Longitud mínima 6, máxima 32.
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  if (token.length < 6 || token.length > 32) return false;
  return /^[A-Za-z0-9_-]+$/.test(token);
}
