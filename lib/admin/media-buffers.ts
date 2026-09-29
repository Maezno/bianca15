/**
 * lib/admin/media-buffers.ts
 * Buffer en memoria para servir imágenes locales en desarrollo / demo.
 * Separado de lib/admin/media.ts para cumplir con la restricción de Next.js
 * de que archivos con 'use server' solo pueden exportar funciones asíncronas.
 */

interface GlobalMediaCache {
  _LOCAL_MEDIA_BUFFERS?: Map<string, { buffer: Buffer; mime: string }>;
}

const globalForMedia = globalThis as unknown as GlobalMediaCache;

export const LOCAL_MEDIA_BUFFERS: Map<string, { buffer: Buffer; mime: string }> =
  globalForMedia._LOCAL_MEDIA_BUFFERS ||
  (globalForMedia._LOCAL_MEDIA_BUFFERS = new Map<string, { buffer: Buffer; mime: string }>());
