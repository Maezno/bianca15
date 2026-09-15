'use server';

import { createClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/utils/token';
import { addDemoGuestGroupFromRsvp } from '@/lib/admin/demo-guests-store';

export interface PublicRsvpPayload {
  eventId: string;
  eventSlug?: string;
  type: 'individual' | 'family';
  name?: string; // Nombre del grupo / familia (opcional en familia, o derivado)
  members: string[]; // Lista de nombres y apellidos de los integrantes
  status: 'confirmed' | 'declined';
  phone?: string;
  comment?: string;
}

export interface PublicRsvpResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitPublicRsvp(payload: PublicRsvpPayload): Promise<PublicRsvpResult> {
  const cleanMembers = (payload.members || [])
    .map((m) => m.trim())
    .filter(Boolean);

  if (payload.status === 'confirmed' && cleanMembers.length === 0) {
    return {
      success: false,
      error: 'Por favor, ingresá al menos un nombre y apellido.',
    };
  }

  // Determinar el nombre representativo del grupo
  let groupName = payload.name?.trim();
  if (!groupName) {
    if (payload.type === 'individual' && cleanMembers[0]) {
      groupName = cleanMembers[0];
    } else if (cleanMembers[0]) {
      groupName = `Familia ${cleanMembers[0].split(' ').pop() || cleanMembers[0]}`;
    } else {
      groupName = 'Invitado';
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Si Supabase está disponible, intentamos persistir directamente en PostgreSQL
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createClient();

      // Resolver ID del evento si es slug o uuid
      let targetEventId = payload.eventId;
      if (!targetEventId || targetEventId.length < 10) {
        const { data: ev } = await supabase
          .from('events')
          .select('id')
          .eq('slug', payload.eventSlug || 'bianca-15')
          .maybeSingle();
        if (ev?.id) targetEventId = ev.id;
      }

      const token = generateToken();
      const guestCount = cleanMembers.length;

      // 1. Crear el grupo de invitados
      const { data: group, error: groupErr } = await supabase
        .from('guest_groups')
        .insert({
          event_id: targetEventId,
          name: groupName,
          token,
          max_guests: Math.max(1, guestCount),
          phone: payload.phone?.trim() || null,
          notes: payload.type === 'family' ? 'Confirmado web como Familia/Grupo' : 'Confirmado web Individual',
        })
        .select('id')
        .single();

      if (group && !groupErr) {
        // 2. Insertar invitados individuales
        if (cleanMembers.length > 0) {
          const guestsToInsert = cleanMembers.map((m) => ({
            group_id: group.id,
            name: m,
          }));
          await supabase.from('guests').insert(guestsToInsert);
        }

        // 3. Insertar confirmación
        const now = new Date().toISOString();
        const { data: conf } = await supabase
          .from('confirmations')
          .insert({
            group_id: group.id,
            status: payload.status,
            guests_count: payload.status === 'confirmed' ? guestCount : 0,
            comment: payload.comment?.trim() || null,
            confirmed_at: now,
          })
          .select('id')
          .single();

        // 4. Si confirmó y hay asistentes, insertar en tabla attendees
        if (payload.status === 'confirmed' && conf?.id && cleanMembers.length > 0) {
          const attendeesToInsert = cleanMembers.map((m) => ({
            confirmation_id: conf.id,
            name: m,
            dietary_restriction: 'none',
          }));
          await supabase.from('attendees').insert(attendeesToInsert);
        }

        // Sincronizar también el store demo para coherencia
        addDemoGuestGroupFromRsvp({
          ...payload,
          name: groupName,
          members: cleanMembers,
        });

        return {
          success: true,
          message:
            payload.status === 'confirmed'
              ? '¡Asistencia confirmada con éxito!'
              : 'Tu respuesta ha sido registrada. ¡Gracias por avisarnos!',
        };
      }
    } catch (err) {
      console.warn('[public-rsvp] Error con Supabase, usando respaldo local:', err);
    }
  }

  // Respaldo en store demo local persistente
  addDemoGuestGroupFromRsvp({
    ...payload,
    name: groupName,
    members: cleanMembers,
  });

  return {
    success: true,
    message:
      payload.status === 'confirmed'
        ? '¡Asistencia confirmada con éxito!'
        : 'Tu respuesta ha sido registrada. ¡Gracias por avisarnos!',
  };
}
