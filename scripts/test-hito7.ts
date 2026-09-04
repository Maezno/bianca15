import { slugify, generateAlternativeSlug } from '../lib/utils/slug';
import { getEventBySlug } from '../lib/events/get-event-by-slug';
import { getGroupByToken } from '../lib/guests/get-group-by-token';
import { getActiveSections, resolveTheme } from '../templates/theme-resolver';
import { wonderlandTheme } from '../templates/wonderland/theme';
import { elegantTheme } from '../templates/elegant/theme';
import { getTemplate, getAllTemplates } from '../templates/registry';

async function runHito7Tests() {
  console.log('🧪 Iniciando verificación automatizada del Hito 7...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  // Test 1: Slugs amigables y seguros
  console.log('1. Generador y Validador de Slugs:');
  assert(slugify('Los 15 de Bianca') === 'los-15-de-bianca', 'Normaliza espacios y mayúsculas');
  assert(slugify('Boda de María & José!') === 'boda-de-maria-jose', 'Remueve diacríticos y caracteres especiales');
  assert(generateAlternativeSlug('los-15-de-bianca', 2) === 'los-15-de-bianca-2', 'Genera slug alternativo con sufijo');
  assert(generateAlternativeSlug('los-15-de-bianca', 3) === 'los-15-de-bianca-3', 'Genera slug alternativo consecutivo');

  // Test 2: Multi-evento - Evento 1 (15 años de Bianca)
  console.log('\n2. Acceso público a Evento 1 (bianca-15):');
  const event1 = await getEventBySlug('bianca-15');
  assert(event1 !== null, 'Obtiene evento bianca-15');
  assert(event1?.status === 'published', 'Estado es published');
  assert(event1?.templateId === 'wonderland', 'Template es wonderland');
  assert(Boolean(event1?.date && event1?.location), 'Tiene fecha y ubicación configuradas');
  assert(Array.isArray(event1?.schedule) && event1.schedule.length > 0, 'Tiene cronograma configurado');

  // Test 3: Multi-evento - Evento 2 (Boda Juan y María)
  console.log('\n3. Acceso público a Evento 2 (juan-y-maria) sin modificar código:');
  const event2 = await getEventBySlug('juan-y-maria');
  assert(event2 !== null, 'Obtiene evento juan-y-maria');
  assert(event2?.status === 'published', 'Estado es published');
  assert(event2?.templateId === 'elegant', 'Template es elegant');
  assert(event2?.name === 'Juan y María', 'Nombre corresponde a Juan y María');
  assert(event2?.dressCode === 'Black Tie / Gala', 'Código de vestimenta específico');

  // Test 4: Control de estados (Draft & Archived)
  console.log('\n4. Control de estados y seguridad de borrador:');
  const draftEvent = await getEventBySlug('evento-draft');
  assert(draftEvent !== null, 'Existe evento-draft');
  assert(draftEvent?.status === 'draft', 'Status es draft (debe ser bloqueado si no es preview)');
  const nonExistent = await getEventBySlug('slug-inexistente-12345');
  assert(nonExistent === null, 'Slug inexistente retorna null (dispara 404)');

  // Test 5: Invitaciones Personalizadas con Contexto de Invitado
  console.log('\n5. Contexto de invitado en invitaciones personalizadas:');
  const group1 = await getGroupByToken('perez-test1', 'bianca-15');
  assert(group1 !== null, 'Obtiene grupo perez-test1 para bianca-15');
  assert(group1?.name === 'Familia Pérez', 'Nombre del grupo es Familia Pérez');
  assert(group1?.maxGuests === 5, 'Tiene 5 lugares asignados');

  const group2 = await getGroupByToken('rodriguez-boda', 'juan-y-maria');
  assert(group2 !== null, 'Obtiene grupo rodriguez-boda para juan-y-maria');
  assert(group2?.name === 'Familia Rodríguez', 'Nombre del grupo es Familia Rodríguez');
  assert(group2?.maxGuests === 4, 'Tiene 4 lugares asignados');

  // Test 6: Aislamiento estricto de eventos por token
  console.log('\n6. Aislamiento de tokens por slug de evento:');
  const crossGroup = await getGroupByToken('perez-test1', 'juan-y-maria');
  assert(crossGroup === null, 'Token de bianca-15 consultado con slug de juan-y-maria es rechazado');

  // Test 7: Configuración de Secciones y Temas Dinámicos
  console.log('\n7. Orquestación de secciones y temas:');
  const defaultSections = ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'photos', 'confirmation', 'share', 'footer'];
  const activeWonderland = getActiveSections(defaultSections, event1?.sectionConfig);
  assert(activeWonderland.includes('hero') && activeWonderland.includes('schedule'), 'Secciones activas respetan configuración de evento 1');

  const resolvedWonderland = resolveTheme(wonderlandTheme, event1?.designConfig);
  assert(Boolean(resolvedWonderland.colors.primary), 'Resuelve tema visual para wonderland');

  const resolvedElegant = resolveTheme(elegantTheme, event2?.designConfig);
  assert(Boolean(resolvedElegant.colors.primary), 'Resuelve tema visual para elegant');

  // Test 8: Registro de Plantillas
  console.log('\n8. Registro de plantillas disponibles:');
  const allTemplates = getAllTemplates();
  assert(allTemplates.length >= 2, 'Hay al menos 2 plantillas registradas (wonderland y elegant)');
  const tWonderland = getTemplate('wonderland');
  assert(tWonderland.id === 'wonderland', 'Plantilla wonderland disponible y tipada');
  const tElegant = getTemplate('elegant');
  assert(tElegant.id === 'elegant', 'Plantilla elegant disponible y tipada');

  console.log(`\n========================================`);
  console.log(`Resultados: ${passed} pasados, ${failed} fallidos.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 Todos los tests del Hito 7 pasaron exitosamente.');
  }
}

runHito7Tests().catch((err) => {
  console.error('Error fatal al ejecutar tests:', err);
  process.exit(1);
});
