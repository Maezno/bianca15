/**
 * lib/admin/qr.ts
 * Generación de Códigos QR nativos mediante la biblioteca 'qrcode'.
 * Soporta generación en cliente y servidor, con alta resolución, márgenes y descarga PNG.
 */

import QRCode from 'qrcode';

export interface QrOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  darkColor?: string;
  lightColor?: string;
}

/**
 * Genera un Data URL en formato PNG (Base64) de alta resolución.
 */
export async function generateQrDataUrl(
  text: string,
  options: QrOptions = {}
): Promise<string> {
  const {
    size = 400,
    margin = 2,
    errorCorrectionLevel = 'M',
    darkColor = '#000000',
    lightColor = '#ffffff',
  } = options;

  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });
  } catch (error) {
    console.error('Error al generar QR Data URL:', error);
    // Fallback en caso de excepción extrema
    const encoded = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
  }
}

/**
 * Genera el string SVG con el código QR.
 */
export async function generateQrSvg(
  text: string,
  options: QrOptions = {}
): Promise<string> {
  const {
    size = 300,
    margin = 2,
    errorCorrectionLevel = 'M',
    darkColor = '#000000',
    lightColor = '#ffffff',
  } = options;

  try {
    return await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });
  } catch (error) {
    console.error('Error al generar QR SVG:', error);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><text x="10" y="20">QR Error</text></svg>`;
  }
}

/**
 * Alias síncrono/inmediato compatible para retrocompatibilidad rápida
 */
export function getQrFallbackUrl(text: string, size = 280): string {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
}
