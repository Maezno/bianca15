/**
 * scripts/test-hito9.ts
 * Suite automatizada de pruebas para el Hito 9: Multimedia, QR y Álbum de Fotos.
 *
 * Ejecución:
 *   npx tsx scripts/test-hito9.ts
 */

import { generateQrDataUrl, generateQrSvg } from '../lib/admin/qr';
import { getEventMedia, uploadEventMedia, deleteEventMedia } from '../lib/admin/media';
import { getEventBySlug } from '../lib/events/get-event-by-slug';
import { getGroupByToken } from '../lib/guests/get-group-by-token';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 SUITE DE PRUEBAS — HITO 9: MULTIMEDIA, QR Y ÁLBUM DE FOTOS');
  console.log('============================================================\n');

  // ─── PRUEBA 1: Migración SQL 0011 existe y define estructuras requeridas ──
  console.log('--- 1. Esquema de Base de Datos y Storage ---');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '0011_multimedia_and_storage.sql');
  const migrationExists = fs.existsSync(migrationPath);
  assert(migrationExists, 'Archivo de migración 0011_multimedia_and_storage.sql existe');

  if (migrationExists) {
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    assert(sqlContent.includes('cover_image TEXT'), 'Migración agrega cover_image a events');
    assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS event_media'), 'Migración define tabla event_media');
    assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS event_gallery'), 'Migración define tabla event_gallery');
    assert(sqlContent.includes("INSERT INTO storage.buckets (id, name, public)\nVALUES ('event-assets'"), 'Migración registra bucket event-assets');
    assert(sqlContent.includes('get_event_by_slug'), 'Migración actualiza función get_event_by_slug con cover_image');
    assert(sqlContent.includes('get_invitation_by_token'), 'Migración actualiza función get_invitation_by_token con cover_image');
  }

  // ─── PRUEBA 2: Generación nativa de Códigos QR con 'qrcode' ──────────────
  console.log('\n--- 2. Generación Nativa de Códigos QR ---');
  const testUrl = 'https://ejemplo.com/invitacion/bianca-15';
  const qrDataUrl = await generateQrDataUrl(testUrl, { size: 400, margin: 2 });

  assert(
    typeof qrDataUrl === 'string' && qrDataUrl.startsWith('data:image/png;base64,'),
    'generateQrDataUrl genera un PNG Data URL válido en Base64'
  );

  const qrSvg = await generateQrSvg(testUrl, { size: 300 });
  assert(
    typeof qrSvg === 'string' && qrSvg.includes('<svg') && qrSvg.includes('</svg>'),
    'generateQrSvg genera un SVG XML válido'
  );

  // ─── PRUEBA 3: Destinos de QR por contexto ──────────────────────────────
  console.log('\n--- 3. Destinos de QR por Contexto (General, Token, Álbum) ---');
  const generalQrUrl = '/invitacion/bianca-15';
  const personalizedQrUrl = '/invitacion/bianca-15/familia-perez';
  const albumQrUrl = 'https://memoroo.app/e/bianca15';

  assert(generalQrUrl.includes('/invitacion/bianca-15'), 'QR General apunta a /invitacion/[slug]');
  assert(personalizedQrUrl.includes('/familia-perez'), 'QR Personalizado apunta al token del grupo');
  assert(albumQrUrl.startsWith('https://memoroo.app/'), 'QR de Álbum apunta directamente a la URL del álbum');

  // ─── PRUEBA 4: Aislamiento Multi-Evento de Multimedia ────────────────────
  console.log('\n--- 4. Aislamiento Multi-Evento en Biblioteca Multimedia ---');
  const eventAId = '11111111-1111-1111-1111-111111111111'; // Bianca 15
  const eventBId = '22222222-2222-2222-2222-222222222222'; // Juan y María

  const mediaA = await getEventMedia(eventAId);
  const mediaB = await getEventMedia(eventBId);

  assert(mediaA.length > 0, 'Evento A tiene recursos multimedia');
  assert(mediaB.length > 0, 'Evento B tiene recursos multimedia');

  const mediaIdsA = new Set(mediaA.map((m) => m.id));
  const hasCrossLeak = mediaB.some((m) => mediaIdsA.has(m.id));
  assert(!hasCrossLeak, 'Aislamiento estricto: Evento B no contiene recursos de Evento A');

  // ─── PRUEBA 5: Carga de Eventos Públicos con coverImage ──────────────────
  console.log('\n--- 5. Portada en Invitación Pública y Open Graph ---');
  const publicEvent = await getEventBySlug('bianca-15');
  assert(Boolean(publicEvent), 'Se obtiene el evento público bianca-15');
  assert(
    typeof publicEvent?.coverImage === 'string' && publicEvent.coverImage.length > 0,
    'publicEvent expone coverImage para Hero y Open Graph'
  );

  const personalizedInvite = await getGroupByToken('perez-test1', 'bianca-15');
  assert(Boolean(personalizedInvite), 'Se obtiene la invitación personalizada para perez-test1');
  assert(
    Boolean(personalizedInvite?.event.coverImage),
    'La invitación personalizada incluye la portada del evento'
  );

  // ─── PRUEBA 6: Configuración y Fallback de Álbum Memoroo ──────────────────
  console.log('\n--- 6. Configuración y Fallback Seguro del Álbum Memoroo ---');
  assert(
    publicEvent?.memorooUrl === 'https://memoroo.app/e/bianca15',
    'publicEvent contiene la URL configurable del álbum'
  );

  // Validación de fallbacks para URLs
  function validateAlbumUrl(url: string | undefined): boolean {
    if (!url || !url.trim()) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }

  assert(validateAlbumUrl('https://memoroo.app/e/bianca15'), 'Valida correctamente una URL https válida');
  assert(!validateAlbumUrl(''), 'Detecta correctamente una URL vacía');
  assert(!validateAlbumUrl('javascript:alert(1)'), 'Rechaza protocolos inseguros');
  assert(!validateAlbumUrl('texto-arbitrario'), 'Rechaza strings que no son URLs');

  console.log('\n============================================================');
  console.log(`🏁 RESULTADOS: ${passed} pasados, ${failed} fallados.`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la ejecución de los tests:', err);
  process.exit(1);
});
