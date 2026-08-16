'use server';

import { createClient } from '@/lib/supabase/server';
import { validateConfirmationPayload } from './validation';
import type { SaveConfirmationInput, SaveConfirmationResult } from './types';

/**
 * Server Action: guarda o actualiza la confirmación de asistencia.
 *
 * Seguridad:
 *  - Solo acepta el token (nunca group_id, event_id, confirmation_id del cliente).
 *  - Valida primero en TypeScript, luego el backend PostgreSQL re-valida todo.
 *  - La RPC save_confirmation resuelve token → group internamente.
 *  - Si algo falla en el lado del servidor (DB), retorna un mensaje amigable.
 *
 * Atomicidad:
 *  - La RPC maneja el UPSERT de confirmation + DELETE/INSERT de attendees
 *    dentro de una única transacción PL/pgSQL implícita.
 */
export async function saveConfirmation(
  input: SaveConfirmationInput
): Promise<SaveConfirmationResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      success: false,
      error:
        'La plataforma no está conectada a la base de datos. Contactá a los organizadores del evento.',
    };
  }

  // ── 1. Resolución del max_guests para validación local ──────────────
  // No confiamos en el valor que llegue del cliente, pero necesitamos un
  // max para la validación TypeScript preliminar. Usamos un valor grande
  // y dejamos que el backend sea la fuente de verdad real.
  // El backend (RPC) SIEMPRE re-valida contra el max_guests real del grupo.
  const SAFE_MAX = 999;

  // ── 2. Validación preliminar en servidor (antes de ir a Supabase) ────
  const errors = validateConfirmationPayload({
    status: input.status,
    guestsCount: input.guestsCount,
    maxGuests: SAFE_MAX,
    attendees: input.attendees,
    comment: input.comment,
  });

  if (errors.length > 0) {
    return {
      success: false,
      error: errors[0].message,
    };
  }

  try {
    const supabase = await createClient();

    // ── 3. Llamar a la RPC atómica ─────────────────────────────────────
    // La RPC recibe el token y resuelve group_id internamente.
    // Nunca confiamos en IDs enviados desde el cliente.
    const { data, error } = await supabase.rpc('save_confirmation', {
      p_token:        input.token,
      p_status:       input.status,
      p_guests_count: input.guestsCount,
      p_comment:      input.comment,
      p_attendees:    input.attendees as unknown as Record<string, string>[],
    });

    if (error) {
      // Mapear errores del backend a mensajes amigables
      const msg = error.message ?? '';
      if (msg.includes('invalid_token')) {
        return { success: false, error: 'Tu enlace de invitación no es válido.' };
      }
      if (msg.includes('invalid_guests_count') || msg.includes('invalid_status')) {
        return { success: false, error: 'Los datos enviados no son válidos.' };
      }
      if (msg.includes('attendees_count_mismatch')) {
        return {
          success: false,
          error: 'La cantidad de asistentes no coincide. Por favor recargá la página.',
        };
      }
      if (msg.includes('comment_too_long')) {
        return { success: false, error: 'El mensaje es demasiado largo.' };
      }
      // Error genérico — no exponer detalles técnicos
      console.error('[saveConfirmation] Supabase error:', error);
      return {
        success: false,
        error: 'No pudimos guardar tu confirmación. Por favor intentá nuevamente.',
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'No pudimos guardar tu confirmación. Por favor intentá nuevamente.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('[saveConfirmation] Unexpected error:', err);
    return {
      success: false,
      error:
        'No pudimos guardar tu confirmación. Por favor intentá nuevamente. Si el error persiste, contactá a los organizadores del evento.',
    };
  }
}
