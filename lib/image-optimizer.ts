/**
 * lib/image-optimizer.ts
 * Conversión client-side a WebP con compresión adaptativa.
 *
 * - Todas las imágenes se convierten a WebP con tamaño máximo de 1 MB.
 * - Para imágenes de fondo principal (purpose: 'background'), se redimensionan
 *   a un máximo de 1920×1080 buscando un equilibrio resolución/compresión.
 * - Para imágenes generales, se permite mayor resolución (hasta 2560px de ancho)
 *   pero se sigue comprimiendo para respetar el límite de 1 MB.
 *
 * El algoritmo usa búsqueda binaria sobre la calidad WebP para encontrar
 * la mejor calidad posible que cumpla con el presupuesto de bytes.
 */

/** Propósito de la imagen — afecta la resolución máxima permitida */
export type ImagePurpose = 'background' | 'general';

/** Resultado de la optimización */
export interface OptimizedImage {
  blob: Blob;
  file: File;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  quality: number;
}

/** Configuración por propósito */
interface PurposeConfig {
  maxWidth: number;
  maxHeight: number;
  label: string;
}

const PURPOSE_CONFIGS: Record<ImagePurpose, PurposeConfig> = {
  background: {
    // Full HD es la resolución ideal para fondos: se ve nítido en la gran
    // mayoría de pantallas móviles y de escritorio, y permite comprimir
    // fácilmente a <1 MB en WebP.
    maxWidth: 1920,
    maxHeight: 1080,
    label: 'Fondo principal',
  },
  general: {
    // Imágenes genéricas (portadas, íconos, fotos de galería) pueden
    // ser un poco más grandes.
    maxWidth: 2560,
    maxHeight: 1440,
    label: 'Imagen general',
  },
};

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const QUALITY_MIN = 0.40; // Nunca bajar de 40% — calidad inaceptable
const QUALITY_MAX = 0.92; // Tope de calidad WebP (más alto ≈ sin compresión)
const BINARY_SEARCH_STEPS = 7; // ~7 pasos = precisión de ~0.4% en la calidad

/**
 * Carga un File/Blob en un HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`No se pudo cargar la imagen: ${e}`));
    img.src = src;
  });
}

/**
 * Calcula las dimensiones de salida manteniendo la relación de aspecto.
 */
function fitDimensions(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  if (srcW <= maxW && srcH <= maxH) {
    return { width: srcW, height: srcH };
  }
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return {
    width: Math.round(srcW * ratio),
    height: Math.round(srcH * ratio),
  };
}

/**
 * Renderiza una imagen en un canvas a las dimensiones especificadas
 * y exporta a WebP con la calidad dada.
 */
function toWebpBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto 2D del canvas.'));
      return;
    }
    // Interpolación de alta calidad para el redimensionado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Error al convertir el canvas a WebP.'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Optimiza una imagen:
 *  1. La redimensiona según el propósito (background vs general).
 *  2. Convierte a WebP.
 *  3. Usa búsqueda binaria para encontrar la calidad más alta que cumpla ≤ 1 MB.
 *
 * Si la imagen original ya es WebP y pesa menos de 1 MB, se retorna directamente.
 */
export async function optimizeImage(
  file: File,
  purpose: ImagePurpose = 'general'
): Promise<OptimizedImage> {
  const originalSize = file.size;
  const config = PURPOSE_CONFIGS[purpose];

  // Crear URL temporal para cargar la imagen
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);
    const { width, height } = fitDimensions(
      img.naturalWidth,
      img.naturalHeight,
      config.maxWidth,
      config.maxHeight
    );

    // Primer intento con calidad alta
    let bestBlob = await toWebpBlob(img, width, height, QUALITY_MAX);

    // Si ya cumple con el límite, devolver directamente
    if (bestBlob.size <= MAX_FILE_SIZE) {
      const resultFile = new File(
        [bestBlob],
        replaceExtension(file.name, 'webp'),
        { type: 'image/webp' }
      );
      return {
        blob: bestBlob,
        file: resultFile,
        width,
        height,
        originalSize,
        optimizedSize: bestBlob.size,
        quality: QUALITY_MAX,
      };
    }

    // Búsqueda binaria: encontrar la calidad más alta que cumpla el límite
    let lo = QUALITY_MIN;
    let hi = QUALITY_MAX;
    let bestQuality = QUALITY_MIN;
    bestBlob = await toWebpBlob(img, width, height, QUALITY_MIN);

    for (let i = 0; i < BINARY_SEARCH_STEPS; i++) {
      const mid = (lo + hi) / 2;
      const testBlob = await toWebpBlob(img, width, height, mid);

      if (testBlob.size <= MAX_FILE_SIZE) {
        bestBlob = testBlob;
        bestQuality = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Si incluso con calidad mínima no cabe, reducir resolución progresivamente
    if (bestBlob.size > MAX_FILE_SIZE) {
      let scale = 0.9;
      while (bestBlob.size > MAX_FILE_SIZE && scale > 0.3) {
        const sw = Math.round(width * scale);
        const sh = Math.round(height * scale);
        bestBlob = await toWebpBlob(img, sw, sh, QUALITY_MIN);
        bestQuality = QUALITY_MIN;
        scale -= 0.1;
      }
    }

    const resultFile = new File(
      [bestBlob],
      replaceExtension(file.name, 'webp'),
      { type: 'image/webp' }
    );

    return {
      blob: bestBlob,
      file: resultFile,
      width,
      height,
      originalSize,
      optimizedSize: bestBlob.size,
      quality: bestQuality,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Reemplaza la extensión de un nombre de archivo.
 */
function replaceExtension(filename: string, newExt: string): string {
  const dotIndex = filename.lastIndexOf('.');
  const baseName = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
  return `${baseName}.${newExt}`;
}

/**
 * Formatea bytes a una cadena legible (ej: "842 KB", "1.2 MB").
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
