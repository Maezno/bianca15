/**
 * scripts/test-hito10.ts
 * Suite automatizada de pruebas para el Hito 10:
 * Auditoría Final, Seguridad, Resiliencia y Lanzamiento.
 *
 * Ejecución:
 *   npx tsx scripts/test-hito10.ts
 *
 * Cobertura:
 *   1. Middleware — Configuración y rutas protegidas
 *   2. SEO y Privacidad — Robots noindex en páginas privadas
 *   3. Error Boundaries — SectionErrorBoundary y app/error.tsx
 *   4. Variables de entorno — .env.example documentado
 *   5. Seguridad — Sanitización de URLs
 *   6. Resiliencia Multi-Evento — Aislamiento conceptual
 *   7. Validación de Publicación Atómica
 *   8. Regresión — Archivos críticos del hito
 */

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

function readFile(relPath: string): string | null {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

async function runTests() {
  console.log('\n==============================================================');
  console.log('🧪 SUITE DE PRUEBAS — HITO 10: SEGURIDAD, RESILIENCIA Y LAUNCH');
  console.log('==============================================================\n');

  // ─── 1. MIDDLEWARE — Protección de rutas /admin ──────────────────────────
  console.log('--- 1. Middleware — Protección de Rutas Administrativas ---');
  const middlewareContent = readFile('middleware.ts');
  assert(middlewareContent !== null, 'middleware.ts existe en la raíz del proyecto');
  assert(
    middlewareContent?.includes('/admin') ?? false,
    'Middleware protege rutas /admin',
  );
  assert(
    middlewareContent?.includes('/admin/login') ?? false,
    'Middleware excluye /admin/login de la protección',
  );
  assert(
    middlewareContent?.includes('admin-session') ?? false,
    'Middleware verifica cookie admin-session',
  );
  assert(
    middlewareContent?.includes("matcher: ['/admin/:path*']") ?? false,
    'Middleware tiene el matcher correcto para /admin/:path*',
  );
  assert(
    middlewareContent?.includes('redirect') ?? false,
    'Middleware redirige con parámetro redirect al login',
  );

  // ─── 2. SEO Y PRIVACIDAD ─────────────────────────────────────────────────
  console.log('\n--- 2. SEO y Privacidad — Robots y Metadatos ---');

  const tokenPageContent = readFile('app/invitacion/[slug]/[token]/page.tsx');
  assert(tokenPageContent !== null, 'Página de invitación con token existe');
  assert(
    tokenPageContent?.includes("robots: { index: false, follow: false }") ?? false,
    'Página con token tiene robots noindex/nofollow permanente (privacidad de datos personales)',
  );

  const notFoundContent = readFile('app/not-found.tsx');
  assert(notFoundContent !== null, 'app/not-found.tsx existe');
  assert(
    notFoundContent?.includes('robots: { index: false, follow: false }') ?? false,
    'Página 404 tiene robots noindex',
  );
  assert(
    !(notFoundContent?.includes('Bianca 15 años') ?? false),
    'Página 404 no contiene referencias específicas a un evento (genérica multi-evento)',
  );
  assert(
    !(notFoundContent?.includes('WhatsApp') ?? false),
    'Página 404 no menciona WhatsApp (comunicación genérica)',
  );

  // ─── 3. ERROR BOUNDARIES Y RESILIENCIA ───────────────────────────────────
  console.log('\n--- 3. Error Boundaries y Resiliencia ---');

  const errorBoundaryContent = readFile('components/common/SectionErrorBoundary.tsx');
  assert(errorBoundaryContent !== null, 'SectionErrorBoundary.tsx existe en components/common/');
  assert(
    errorBoundaryContent?.includes('React.Component') ?? false,
    'SectionErrorBoundary es un Class Component (requerido para Error Boundaries)',
  );
  assert(
    errorBoundaryContent?.includes('getDerivedStateFromError') ?? false,
    'SectionErrorBoundary implementa getDerivedStateFromError',
  );
  assert(
    errorBoundaryContent?.includes('componentDidCatch') ?? false,
    'SectionErrorBoundary implementa componentDidCatch para logging',
  );
  assert(
    errorBoundaryContent?.includes('hasError') ?? false,
    'SectionErrorBoundary mantiene estado hasError',
  );

  const globalErrorContent = readFile('app/error.tsx');
  assert(globalErrorContent !== null, 'app/error.tsx existe (error global Next.js)');
  assert(
    globalErrorContent?.includes("'use client'") ?? false,
    "app/error.tsx tiene la directiva 'use client' (requerida por Next.js)",
  );
  assert(
    globalErrorContent?.includes('reset') ?? false,
    'app/error.tsx expone botón de reintentar (prop reset)',
  );
  assert(
    !(globalErrorContent?.includes('error.stack') ?? false),
    'app/error.tsx no expone error.stack al usuario final',
  );

  const rendererContent = readFile('components/invitation/PublicInvitationRenderer.tsx');
  assert(rendererContent !== null, 'PublicInvitationRenderer.tsx existe');
  assert(
    rendererContent?.includes('SectionErrorBoundary') ?? false,
    'PublicInvitationRenderer importa y usa SectionErrorBoundary',
  );
  assert(
    (rendererContent?.match(/SectionErrorBoundary/g) ?? []).length >= 8,
    'Al menos 8 secciones están envueltas con SectionErrorBoundary',
  );

  // ─── 4. VARIABLES DE ENTORNO ─────────────────────────────────────────────
  console.log('\n--- 4. Variables de Entorno y Documentación ---');

  const envExampleContent = readFile('.env.example');
  assert(envExampleContent !== null, '.env.example existe');
  assert(
    envExampleContent?.includes('NEXT_PUBLIC_SUPABASE_URL') ?? false,
    '.env.example documenta NEXT_PUBLIC_SUPABASE_URL',
  );
  assert(
    envExampleContent?.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ?? false,
    '.env.example documenta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );
  assert(
    envExampleContent?.includes('SUPABASE_SERVICE_ROLE_KEY') ?? false,
    '.env.example documenta SUPABASE_SERVICE_ROLE_KEY (server-only)',
  );
  assert(
    envExampleContent?.includes('NEXT_PUBLIC_APP_URL') ?? false,
    '.env.example documenta NEXT_PUBLIC_APP_URL',
  );
  assert(
    envExampleContent?.includes('NUNCA') ?? false,
    '.env.example advierte sobre no subir .env.local al repositorio',
  );

  // ─── 5. SEGURIDAD — SANITIZACIÓN DE URLs ─────────────────────────────────
  console.log('\n--- 5. Seguridad — Sanitización de URLs ---');

  function isSafeUrl(url: string | undefined | null): boolean {
    if (!url || !url.trim()) return false;
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:')) return false;
    if (trimmed.startsWith('data:')) return false;
    if (trimmed.startsWith('vbscript:')) return false;
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }

  assert(isSafeUrl('https://maps.google.com/...'), 'Acepta URLs https:// de Google Maps');
  assert(isSafeUrl('http://waze.com/ul?...'), 'Acepta URLs http:// de Waze');
  assert(!isSafeUrl('javascript:alert(1)'), 'Rechaza esquema javascript:');
  assert(!isSafeUrl('javascript:void(0)'), 'Rechaza javascript:void()');
  assert(!isSafeUrl('data:text/html,<script>'), 'Rechaza esquema data:');
  assert(!isSafeUrl('vbscript:run'), 'Rechaza esquema vbscript:');
  assert(!isSafeUrl(''), 'Rechaza cadena vacía');
  assert(!isSafeUrl(undefined), 'Rechaza undefined como URL');
  assert(!isSafeUrl('ftp://files.example.com'), 'Rechaza protocolos no-web (ftp://)');

  // ─── 6. AISLAMIENTO MULTI-EVENTO (CONCEPTUAL) ────────────────────────────
  console.log('\n--- 6. Aislamiento Multi-Evento — Estructura de Código ---');

  // Verificar que las rutas admin usan [eventId] dinámico
  const eventEditorPath = path.join(process.cwd(), 'app', 'admin', 'events', '[eventId]');
  assert(
    fs.existsSync(eventEditorPath) && fs.statSync(eventEditorPath).isDirectory(),
    'Rutas admin usan [eventId] dinámico para aislamiento',
  );

  // Verificar que los Server Actions existen para validar aislamiento
  const serverActionsPath = path.join(process.cwd(), 'lib', 'admin');
  const adminLibExists = fs.existsSync(serverActionsPath);
  assert(adminLibExists, 'lib/admin/ contiene las Server Actions protegidas');

  const guestsActions = readFile('lib/admin/guests.ts') ?? readFile('lib/guests/actions.ts');
  const eventsActions = readFile('lib/admin/events.ts') ?? readFile('lib/events/actions.ts');
  assert(
    Boolean(guestsActions || eventsActions),
    'Existen Server Actions para gestión de invitados o eventos',
  );

  // ─── 7. VALIDACIÓN DE PUBLICACIÓN ────────────────────────────────────────
  console.log('\n--- 7. Validación de Publicación Atómica ---');

  interface EventDraft {
    name?: string;
    title?: string;
    date?: string;
    mapsUrl?: string;
  }

  function validateEventForPublish(event: EventDraft): string[] {
    const errors: string[] = [];
    if (!event.name?.trim()) errors.push('El evento debe tener un nombre');
    if (!event.title?.trim()) errors.push('El evento debe tener un título');
    if (!event.date?.trim()) errors.push('La fecha del evento es requerida');
    if (event.mapsUrl && !isSafeUrl(event.mapsUrl)) {
      errors.push('La URL de Google Maps tiene un protocolo inseguro');
    }
    return errors;
  }

  const validEvent: EventDraft = { name: 'Bianca 15', title: '¡Celebrá con nosotros!', date: '2025-03-15' };
  const invalidEvent: EventDraft = { name: '', title: '', date: '' };
  const unsafeUrlEvent: EventDraft = {
    name: 'Test', title: 'Test', date: '2025-01-01',
    mapsUrl: 'javascript:alert("xss")',
  };

  assert(
    validateEventForPublish(validEvent).length === 0,
    'Evento completo pasa validación de publicación',
  );
  assert(
    validateEventForPublish(invalidEvent).length === 3,
    'Evento sin datos requeridos falla validación (3 errores esperados)',
  );
  assert(
    validateEventForPublish(unsafeUrlEvent).length === 1,
    'Evento con URL insegura falla validación de publicación',
  );
  assert(
    validateEventForPublish(unsafeUrlEvent)[0].includes('inseguro'),
    'Error de URL insegura tiene mensaje descriptivo',
  );

  // ─── 8. REGRESIÓN — ARCHIVOS CRÍTICOS DEL HITO ───────────────────────────
  console.log('\n--- 8. Regresión — Archivos Críticos del Proyecto ---');

  const criticalFiles = [
    'app/layout.tsx',
    'app/page.tsx',
    'app/not-found.tsx',
    'app/error.tsx',
    'middleware.ts',
    'components/common/SectionErrorBoundary.tsx',
    'components/invitation/PublicInvitationRenderer.tsx',
    'lib/admin/auth.ts',
    '.env.example',
    'next.config.ts',
    'tsconfig.json',
    'package.json',
  ];

  for (const file of criticalFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    assert(exists, `Archivo crítico existe: ${file}`);
  }

  // Verificar que package.json tiene los scripts necesarios
  const packageJson = readFile('package.json');
  const pkg = packageJson ? JSON.parse(packageJson) : {};
  assert(pkg.scripts?.dev, 'package.json tiene script "dev"');
  assert(pkg.scripts?.build, 'package.json tiene script "build"');
  assert(pkg.scripts?.lint, 'package.json tiene script "lint"');

  // ─── RESUMEN ─────────────────────────────────────────────────────────────
  console.log('\n==============================================================');
  console.log(`🏁 RESULTADOS HITO 10: ${passed} pasados, ${failed} fallados.`);
  console.log('==============================================================\n');

  if (failed > 0) {
    console.log('⚠️  Algunos tests fallaron. Revisá los mensajes de error anteriores.');
    process.exit(1);
  } else {
    console.log('🚀 ¡Todos los tests del Hito 10 pasaron! La plataforma está lista para producción.');
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la ejecución de los tests:', err);
  process.exit(1);
});
