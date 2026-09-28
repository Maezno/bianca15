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
  skipped: boolean;
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
    // fácilmente a <1 MB en WebP con altísima fidelidad visual.
    maxWidth: 1920,
    maxHeight: 1080,
    label: 'Fondo principal',
  },
  general: {
    // Imágenes genéricas (portadas, fotos de galería) pueden
    // ser un poco más grandes.
    maxWidth: 2560,
    maxHeight: 1440,
    label: 'Imagen general',
  },
};

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const QUALITY_MIN = 0.40; // Calidad mínima aceptable
const QUALITY_MAX = 0.92; // Tope de calidad WebP óptimo
const BINARY_SEARCH_STEPS = 7; // Precisión fina

/**
 * Carga un File/Blob en un HTMLImageElement y espera a que los píxeles
 * estén decodificados y listos para dibujar en canvas.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Solo aplicar crossOrigin en URLs remotas, no en blob: o data:
    if (!src.startsWith('blob:') && !src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = async () => {
      try {
        if (img.decode) {
          await img.decode();
        }
        resolve(img);
      } catch {
        resolve(img);
      }
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen en el navegador.'));
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
 * Detecta si el navegador soporta exportar canvas a WebP.
 */
function supportsWebP(): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Renderiza una imagen en un canvas a las dimensiones especificadas
 * y exporta a WebP (o PNG como fallback) con la calidad dada.
 */
function toBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
  mimeType: 'image/webp' | 'image/png' = 'image/webp'
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
          reject(new Error('Error al convertir el canvas a imagen.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

/**
 * Optimiza una imagen:
 *  1. Si ya es WebP y pesa ≤ 1 MB (y no necesita redimensionarse), la retorna sin tocar.
 *  2. La redimensiona según el propósito (background vs general).
 *  3. Convierte a WebP.
 *  4. Usa búsqueda binaria para encontrar la calidad más alta que cumpla ≤ 1 MB.
 */
export async function optimizeImage(
  file: File,
  purpose: ImagePurpose = 'general'
): Promise<OptimizedImage> {
  const originalSize = file.size;
  const config = PURPOSE_CONFIGS[purpose];

  // Determinar formato de salida
  const canWebP = supportsWebP();
  const outputMime: 'image/webp' | 'image/png' = canWebP ? 'image/webp' : 'image/png';
  const outputExt = canWebP ? 'webp' : 'png';

  // Crear URL temporal para cargar la imagen en el cliente
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const isWebP = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
    const needsResize = naturalW > config.maxWidth || naturalH > config.maxHeight;

    // Si ya es WebP, pesa ≤ 1 MB y no necesita redimensionarse → conservar intacta
    if (isWebP && file.size <= MAX_FILE_SIZE && !needsResize) {
      return {
        blob: file,
        file,
        width: naturalW,
        height: naturalH,
        originalSize,
        optimizedSize: file.size,
        quality: 1,
        skipped: true,
      };
    }

    const { width, height } = fitDimensions(naturalW, naturalH, config.maxWidth, config.maxHeight);
    let outWidth = width;
    let outHeight = height;

    // Primer intento con calidad alta
    let bestBlob = await toBlob(img, outWidth, outHeight, QUALITY_MAX, outputMime);

    // Si ya cumple con el límite, devolver directamente
    if (bestBlob.size <= MAX_FILE_SIZE) {
      const resultFile = new File(
        [bestBlob],
        replaceExtension(file.name, outputExt),
        { type: outputMime }
      );
      return {
        blob: bestBlob,
        file: resultFile,
        width: outWidth,
        height: outHeight,
        originalSize,
        optimizedSize: bestBlob.size,
        quality: QUALITY_MAX,
        skipped: false,
      };
    }

    // Búsqueda binaria: encontrar la calidad más alta que cumpla el límite
    let lo = QUALITY_MIN;
    let hi = QUALITY_MAX;
    let bestQuality = QUALITY_MIN;
    bestBlob = await toBlob(img, outWidth, outHeight, QUALITY_MIN, outputMime);

    for (let i = 0; i < BINARY_SEARCH_STEPS; i++) {
      const mid = (lo + hi) / 2;
      const testBlob = await toBlob(img, outWidth, outHeight, mid, outputMime);

      if (testBlob.size <= MAX_FILE_SIZE) {
        bestBlob = testBlob;
        bestQuality = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Si incluso con calidad mínima supera 1MB, reducir resolución progresivamente
    if (bestBlob.size > MAX_FILE_SIZE) {
      let scale = 0.9;
      while (bestBlob.size > MAX_FILE_SIZE && scale > 0.3) {
        outWidth = Math.round(width * scale);
        outHeight = Math.round(height * scale);
        bestBlob = await toBlob(img, outWidth, outHeight, QUALITY_MIN, outputMime);
        bestQuality = QUALITY_MIN;
        scale -= 0.1;
      }
    }

    const resultFile = new File(
      [bestBlob],
      replaceExtension(file.name, outputExt),
      { type: outputMime }
    );

    return {
      blob: bestBlob,
      file: resultFile,
      width: outWidth,
      height: outHeight,
      originalSize,
      optimizedSize: bestBlob.size,
      quality: bestQuality,
      skipped: false,
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
