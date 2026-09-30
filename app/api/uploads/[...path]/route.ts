import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { LOCAL_MEDIA_BUFFERS } from '@/lib/admin/media-buffers';

const MIME_MAP: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
  otf: 'font/otf',
};

export async function GET(
  request: Request,
  props: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await props.params;

  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Prevenir directory traversal
  for (const seg of pathSegments) {
    if (seg.includes('..') || seg.includes('/') || seg.includes('\\')) {
      return new NextResponse('Invalid path', { status: 400 });
    }
  }

  // Si la ruta comienza con 'event-assets', la clave en LOCAL_MEDIA_BUFFERS es relativa a 'event-assets/'
  let storageKey = '';
  if (pathSegments[0] === 'event-assets') {
    storageKey = pathSegments.slice(1).join('/');
  } else {
    storageKey = pathSegments.join('/');
  }

  // 1. Buscar primero en el buffer en memoria (rápido y resistente a HMR)
  const memoryItem = LOCAL_MEDIA_BUFFERS?.get(storageKey);
  if (memoryItem) {
    return new NextResponse(new Uint8Array(memoryItem.buffer), {
      status: 200,
      headers: {
        'Content-Type': memoryItem.mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // 2. Buscar en disco en public/uploads/...
  try {
    const diskPath = path.join(process.cwd(), 'public', 'uploads', ...pathSegments);
    if (fs.existsSync(diskPath)) {
      const fileBuffer = await fs.promises.readFile(diskPath);
      const ext = path.extname(diskPath).replace('.', '').toLowerCase();
      const mime = MIME_MAP[ext] || 'application/octet-stream';

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (err) {
    console.error('Error al leer archivo local en api/uploads:', err);
  }

  return new NextResponse('Media not found', { status: 404 });
}
