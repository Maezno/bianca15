import { createClient } from '@/lib/supabase/server';
import type { ExistingConfirmation } from './types';

/**
 * Obtiene la confirmación existente de un grupo mediante su token.
 * Usa la RPC get_confirmation_by_token (SECURITY DEFINER) para mantener
 * RLS cerrado — nunca accede directamente a las tablas.
 *
 * Retorna null si:
 *  - Supabase no está configurado (entorno de demo).
 *  - El token no existe.
 *  - El grupo aún no tiene confirmación.
 */
export async function getConfirmationByToken(
  token: string
): Promise<ExistingConfirmation | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Entorno sin Supabase: no hay confirmaciones previas
    return null;
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_confirmation_by_token', {
      p_token: token,
    });

    if (error || !data) return null;

    const raw = data as {
      status: string;
      guests_count: number | null;
      comment: string | null;
      confirmed_at: string | null;
      attendees: Array<{ name: string; dietary_restriction: string | null }>;
    };

    return {
      status: raw.status as ExistingConfirmation['status'],
      guestsCount: raw.guests_count,
      comment: raw.comment,
      confirmedAt: raw.confirmed_at,
      attendees: (raw.attendees ?? []).map((a) => ({
        name: a.name,
        dietaryRestriction: a.dietary_restriction,
      })),
    };
  } catch {
    return null;
  }
}
