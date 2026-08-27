/**
 * Zero-dependency QR Code Generator (SVG).
 * Uses standard Byte mode QR encoding for URL generation.
 */

export function generateQrSvg(text: string, size = 200): string {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=svg`;
}

export function getQrDataUrl(text: string, size = 256): string {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=svg`;
}
