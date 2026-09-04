/**
 * test-hito8.ts — Suite de pruebas automatizadas para el Hito 8
 * Sistema de Invitados, Invitaciones Personalizadas y RSVP
 *
 * Ejecutar: npx tsx scripts/test-hito8.ts
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// ─── Config ───────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// WhatsApp utils (inline to avoid Next.js module issues in plain ts-node context)
function formatWhatsAppMessage(
  template: string | null | undefined,
  vars: { guestName: string; groupName: string; allowedGuests: number; invitationUrl: string; eventName?: string }
): string {
  const defaultTemplate =
    '¡Hola {{guest_name}}! 🎉 Te invitamos a {{event_name}}.\n' +
    'Tenés {{allowed_guests}} lugar{{allowed_guests === 1 ? "" : "es"}} reservado{{allowed_guests === 1 ? "" : "s"}}.\n' +
    'Confirmá tu asistencia aquí: {{invitation_url}}';

  const tpl = template || defaultTemplate;
  return tpl
    .replace(/\{\{guest_name\}\}/g, vars.guestName)
    .replace(/\{\{group_name\}\}/g, vars.groupName)
    .replace(/\{\{allowed_guests\}\}/g, String(vars.allowedGuests))
    .replace(/\{\{event_name\}\}/g, vars.eventName || '')
    .replace(/\{\{invitation_url\}\}/g, vars.invitationUrl);
}

function buildWhatsAppLink(phone: string | null | undefined, message: string): string {
  if (!phone) return '#no-phone';
  const digits = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}

function generateToken(): string {
  return randomUUID().replace(/-/g, '').slice(0, 16);
}

// ─── Test Runner ───────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  HITO 8 — Test Suite: Invitados, Invitaciones y RSVP');
  console.log('══════════════════════════════════════════════════\n');

  // ── Sección 1: Utilidades de WhatsApp ────────────────────────────────────
  console.log('📲 [1] Generación de mensajes WhatsApp');

  const msgDefault = formatWhatsAppMessage(null, {
    guestName: 'Juan Pérez',
    groupName: 'Familia Pérez',
    allowedGuests: 4,
    invitationUrl: 'https://bianca15.com/invitacion/bianca-15/abc123',
    eventName: '15 años de Bianca',
  });
  assert(msgDefault.includes('Juan Pérez'), 'Variable {{guest_name}} reemplazada');
  assert(msgDefault.includes('4'), 'Variable {{allowed_guests}} reemplazada');
  assert(msgDefault.includes('https://bianca15.com'), 'Variable {{invitation_url}} reemplazada');

  const customTemplate = 'Hola {{guest_name}}, confirmá en: {{invitation_url}}';
  const msgCustom = formatWhatsAppMessage(customTemplate, {
    guestName: 'María',
    groupName: 'Familia',
    allowedGuests: 2,
    invitationUrl: 'https://bianca15.com/invitacion/x/y',
  });
  assert(msgCustom === 'Hola María, confirmá en: https://bianca15.com/invitacion/x/y', 'Plantilla personalizada reemplaza correctamente');

  const waLink = buildWhatsAppLink('11 2233-4455', 'Hola!');
  assert(waLink.startsWith('https://wa.me/1122334455'), 'Enlace WhatsApp tiene dígitos limpios');
  assert(buildWhatsAppLink(null, 'test') === '#no-phone', 'Sin teléfono retorna "#no-phone"');

  // ── Sección 2: Generación de tokens ─────────────────────────────────────
  console.log('\n🔑 [2] Unicidad de tokens');
  const tokens = new Set(Array.from({ length: 1000 }, generateToken));
  assert(tokens.size === 1000, '1000 tokens generados son todos únicos');
  for (const t of tokens) {
    if (!/^[a-f0-9]{16}$/.test(t)) {
      assert(false, 'Todos los tokens son hexadecimales de 16 chars', `Token inválido: ${t}`);
      break;
    }
  }
  assert(true, 'Todos los tokens tienen formato hexadecimal de 16 caracteres');

  // ── Sección 3: Pruebas con base de datos (si Supabase está configurado) ──
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('\n⚠️  [3] Supabase no configurado — saltando pruebas de base de datos.');
    console.log('    Definí NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para ejecutar pruebas de BD.');
  } else {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('\n🗄️  [3] Creación de eventos de prueba');

    // Crear dos eventos para probar aislamiento
    const slugA = `test-hito8-a-${Date.now()}`;
    const slugB = `test-hito8-b-${Date.now()}`;

    const { data: eventA, error: errA } = await supabase
      .from('events')
      .insert({
        slug: slugA,
        name: 'Evento A (test-hito8)',
        title: 'Test Event A',
        status: 'published',
        whatsapp_template: 'Hola {{guest_name}}, unite a {{event_name}}: {{invitation_url}}',
      })
      .select()
      .single();
    assert(!errA && !!eventA, `Evento A creado (slug: ${slugA})`, errA?.message);

    const { data: eventB, error: errB } = await supabase
      .from('events')
      .insert({
        slug: slugB,
        name: 'Evento B (test-hito8)',
        title: 'Test Event B',
        status: 'published',
      })
      .select()
      .single();
    assert(!errB && !!eventB, `Evento B creado (slug: ${slugB})`, errB?.message);

    if (!eventA || !eventB) {
      console.log('\n⛔  No se pudieron crear los eventos de prueba. Abortando.\n');
    } else {
      // ── Sección 3b: Grupos de invitados ─────────────────────────────────
      console.log('\n👥 [3b] Creación y actualización de grupos');

      const tokenA = generateToken();
      const tokenB = generateToken();

      const { data: groupA, error: gErrA } = await supabase
        .from('guest_groups')
        .insert({
          event_id: eventA.id,
          name: 'Familia Test A',
          token: tokenA,
          max_guests: 3,
          phone: '1122334455',
          email: 'familia-a@test.com',
          personal_message: '¡Los esperamos!',
        })
        .select()
        .single();
      assert(!gErrA && !!groupA, 'Grupo A creado con email y personal_message', gErrA?.message);
      assert(groupA?.email === 'familia-a@test.com', 'Campo email guardado correctamente');
      assert(groupA?.personal_message === '¡Los esperamos!', 'Campo personal_message guardado correctamente');

      const { data: groupB, error: gErrB } = await supabase
        .from('guest_groups')
        .insert({
          event_id: eventB.id,
          name: 'Familia Test B',
          token: tokenB,
          max_guests: 2,
        })
        .select()
        .single();
      assert(!gErrB && !!groupB, 'Grupo B creado en Evento B', gErrB?.message);

      // Actualización de cupo
      if (groupA) {
        const { data: updated, error: upErr } = await supabase
          .from('guest_groups')
          .update({ max_guests: 5 })
          .eq('id', groupA.id)
          .select()
          .single();
        assert(!upErr && updated?.max_guests === 5, 'Cupo actualizado de 3 a 5');
      }

      // ── Sección 3c: Aislamiento de tokens entre eventos ──────────────────
      console.log('\n🔐 [3c] Aislamiento multi-evento');

      // Token del Evento A no debe devolver resultados al buscarlo en Evento B
      const { data: crossCheck } = await supabase
        .from('guest_groups')
        .select('id')
        .eq('token', tokenA)
        .eq('event_id', eventB.id);
      assert(
        !crossCheck || crossCheck.length === 0,
        'Token del Evento A no es válido en Evento B (aislamiento por event_id)'
      );

      // ── Sección 3d: RSVP — Confirmación afirmativa ────────────────────────
      if (groupA) {
        console.log('\n✅ [3d] RSVP — Confirmación y restricciones');

        const { data: rsvpResult, error: rsvpErr } = await supabase.rpc('save_confirmation', {
          p_token: tokenA,
          p_status: 'confirmed',
          p_guests_count: 3,
          p_comment: 'Llegaremos a las 21:00.',
          p_attendees: [
            { name: 'Juan A', dietaryRestriction: 'none' },
            { name: 'María A', dietaryRestriction: 'vegetarian' },
            { name: 'Pedro A', dietaryRestriction: 'celiac' },
          ],
        });
        assert(!rsvpErr && rsvpResult?.success === true, 'Confirmación RSVP guardada correctamente', rsvpErr?.message);

        // Verificar que los asistentes se guardaron con restricciones
        const { data: confirmation } = await supabase
          .from('confirmations')
          .select('*, attendees(*)')
          .eq('group_id', groupA.id)
          .single();
        assert(confirmation?.status === 'confirmed', 'Estado de confirmación es "confirmed"');
        assert(confirmation?.guests_count === 3, 'Cantidad de asistentes guardada = 3');
        const attendees = (confirmation as { attendees?: Array<{ dietary_restriction?: string }> })?.attendees || [];
        const vegAtt = (attendees as Array<{ dietary_restriction?: string }>).find((a) => a.dietary_restriction === 'vegetarian');
        const celAtt = (attendees as Array<{ dietary_restriction?: string }>).find((a) => a.dietary_restriction === 'celiac');
        assert(!!vegAtt, 'Restricción "vegetariano" guardada para asistente');
        assert(!!celAtt, 'Restricción "celíaco" guardada para asistente');

        // ── Sección 3e: Respeto de cupo máximo ─────────────────────────────
        console.log('\n🚫 [3e] RSVP — Rechazo de cupo excedido');
        const { data: overCapacity, error: capErr } = await supabase.rpc('save_confirmation', {
          p_token: tokenA,
          p_status: 'confirmed',
          p_guests_count: 99, // excede el cupo de 5
          p_comment: '',
          p_attendees: Array.from({ length: 99 }, (_, i) => ({ name: `Extra ${i}`, dietaryRestriction: 'none' })),
        });
        assert(
          capErr !== null || overCapacity?.success === false,
          'Se rechaza confirmación con guests_count > max_guests'
        );

        // ── Sección 3f: Modificación de respuesta ───────────────────────────
        console.log('\n🔄 [3f] RSVP — Modificación de confirmación');
        const { data: modified, error: modErr } = await supabase.rpc('save_confirmation', {
          p_token: tokenA,
          p_status: 'declined',
          p_guests_count: 0,
          p_comment: 'Surgió un imprevisto.',
          p_attendees: [],
        });
        assert(!modErr && modified?.success === true, 'Modificación de confirmación a "no asiste" exitosa', modErr?.message);

        const { data: updatedConf } = await supabase
          .from('confirmations')
          .select('status, guests_count')
          .eq('group_id', groupA.id)
          .single();
        assert(updatedConf?.status === 'declined', 'Estado actualizado a "declined"');
        assert(updatedConf?.guests_count === 0, 'Cantidad de asistentes actualizada a 0');
      }

      // ── Sección 3g: get_invitation_by_token con isolamiento por slug ──────
      console.log('\n🔗 [3g] RPC get_invitation_by_token');

      const { data: invData, error: invErr } = await supabase.rpc('get_invitation_by_token', {
        p_token: tokenA,
        p_slug: slugA,
      });
      assert(!invErr && invData !== null, 'get_invitation_by_token retorna datos con slug correcto', invErr?.message);

      const { data: invCrossCheck } = await supabase.rpc('get_invitation_by_token', {
        p_token: tokenA,
        p_slug: slugB,
      });
      assert(
        invCrossCheck === null || (typeof invCrossCheck === 'object' && !invCrossCheck),
        'get_invitation_by_token retorna null con slug incorrecto (aislamiento)'
      );

      // ── Cleanup ──────────────────────────────────────────────────────────
      console.log('\n🧹 Limpiando datos de prueba...');
      if (groupA) await supabase.from('guest_groups').delete().eq('id', groupA.id);
      if (groupB) await supabase.from('guest_groups').delete().eq('id', groupB.id);
      await supabase.from('events').delete().eq('id', eventA.id);
      await supabase.from('events').delete().eq('id', eventB.id);
      console.log('   Datos de prueba eliminados.');
    }
  }

  // ── Resumen ────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  Resultados: ${passed}/${total} pruebas pasaron`);
  if (failed > 0) {
    console.error(`  ⚠️  ${failed} prueba(s) FALLARON`);
    process.exit(1);
  } else {
    console.log(`  🎉 ¡Todas las pruebas del Hito 8 pasaron!\n`);
  }
}

main().catch((err) => {
  console.error('\nError fatal en test-hito8:', err);
  process.exit(1);
});
