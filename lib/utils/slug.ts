/**
 * Utilidades para generación y normalización de slugs seguros y amigables (Punto 22 del Hito 7).
 */

export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .normalize('NFD') // Normalizar diacríticos
    .replace(/[\u0300-\u036f]/g, '') // Remover tildes y diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres no permitidos
    .replace(/[\s_]+/g, '-') // Convertir espacios o guiones bajos en guiones
    .replace(/-+/g, '-') // Evitar múltiples guiones consecutivos
    .replace(/^-+|-+$/g, ''); // Quitar guiones iniciales o finales
}

/**
 * Genera un slug alternativo con sufijo numérico o hash si ya existe colisión.
 */
export function generateAlternativeSlug(baseSlug: string, attempt: number = 2): string {
  const cleanBase = slugify(baseSlug) || 'evento';
  return `${cleanBase}-${attempt}`;
}
