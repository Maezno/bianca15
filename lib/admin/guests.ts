'use server';

import { createClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/utils/token';
import type { AdminGuestGroupItem, CreateAdminGroupInput, UpdateAdminGroupInput, CsvValidatedRow } from './types';
import type { Guest, Confirmation, Attendee } from '@/types/database';

import { loadDemoGuestGroups, saveDemoGuestGroups } from './demo-guests-store';

export async function getAdminGuestGroups(
  eventId: string,
  eventSlug: string = 'bianca-15'
): Promise<AdminGuestGroupItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const demoGroups = loadDemoGuestGroups();
    return demoGroups
      .filter((g) => !eventId || g.event_id === eventId || g.event_id === '11111111-1111-1111-1111-111111111111')
      .map((g) => ({
        ...g,
        invitationUrl: `/invitacion/${eventSlug}/${g.token}`,
      }));
  }

  try {
    const supabase = await createClient();

    const { data: groups, error } = await supabase
      .from('guest_groups')
      .select(`
        id, event_id, name, token, max_guests, phone, email, notes, personal_message, created_at, updated_at,
        guests ( id, group_id, name, created_at, updated_at ),
        confirmations (
          id, group_id, status, guests_count, comment, confirmed_at, created_at, updated_at,
          attendees ( id, confirmation_id, name, dietary_restriction, created_at, updated_at )
        )
      `)
      .eq('event_id', eventId)
      .order('name', { ascending: true });

    if (error || !groups) {
      const demoGroups = loadDemoGuestGroups();
      return demoGroups
        .filter((g) => !eventId || g.event_id === eventId || g.event_id === '11111111-1111-1111-1111-111111111111')
        .map((g) => ({
          ...g,
          invitationUrl: `/invitacion/${eventSlug}/${g.token}`,
        }));
    }

    return (groups as unknown as Array<{
      id: string;
      event_id: string;
      name: string;
      token: string;
      max_guests: number;
      phone: string | null;
      email: string | null;
      notes: string | null;
      personal_message: string | null;
      created_at: string;
      updated_at: string;
      guests: Guest[];
      confirmations: Array<Confirmation & { attendees: Attendee[] }> | (Confirmation & { attendees: Attendee[] }) | null;
    }>).map((g) => {
      const confRaw = Array.isArray(g.confirmations) ? g.confirmations[0] : g.confirmations;
      const conf: Confirmation | null = confRaw
        ? {
            id: confRaw.id,
            group_id: confRaw.group_id,
            status: confRaw.status,
            guests_count: confRaw.guests_count,
            comment: confRaw.comment,
            confirmed_at: confRaw.confirmed_at,
            created_at: confRaw.created_at,
            updated_at: confRaw.updated_at,
          }
        : null;
      const attendees: Attendee[] = confRaw?.attendees || [];

      return {
        id: g.id,
        event_id: g.event_id,
        name: g.name,
        token: g.token,
        max_guests: g.max_guests,
        phone: g.phone,
        email: g.email,
        notes: g.notes,
        personal_message: g.personal_message,
        created_at: g.created_at,
        updated_at: g.updated_at,
        guests: g.guests || [],
        confirmation: conf,
        attendees,
        invitationUrl: `/invitacion/${eventSlug}/${g.token}`,
      };
    });
  } catch {
    const demoGroups = loadDemoGuestGroups();
    return demoGroups
      .filter((g) => !eventId || g.event_id === eventId || g.event_id === '11111111-1111-1111-1111-111111111111')
      .map((g) => ({
        ...g,
        invitationUrl: `/invitacion/${eventSlug}/${g.token}`,
      }));
  }
}

export async function createAdminGuestGroup(
  input: CreateAdminGroupInput
): Promise<{ success: boolean; groupId?: string; error?: string }> {
  if (!input.name?.trim()) {
    return { success: false, error: 'El nombre del grupo es obligatorio.' };
  }
  if (!input.maxGuests || input.maxGuests < 1) {
    return { success: false, error: 'El cupo debe ser al menos 1.' };
  }

  const token = generateToken();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: true, groupId: 'demo-new-group-id' };
  }

  try {
    const supabase = await createClient();

    const { data: group, error } = await supabase
      .from('guest_groups')
      .insert({
        event_id: input.eventId,
        name: input.name.trim(),
        token,
        max_guests: input.maxGuests,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        notes: input.notes?.trim() || null,
        personal_message: input.personalMessage?.trim() || null,
      })
      .select('id')
      .single();

    if (error || !group) {
      return { success: false, error: 'No se pudo crear el grupo.' };
    }

    if (input.initialGuests && input.initialGuests.length > 0) {
      const guestsToInsert = input.initialGuests
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) => ({
          group_id: group.id,
          name,
        }));

      if (guestsToInsert.length > 0) {
        await supabase.from('guests').insert(guestsToInsert);
      }
    }

    return { success: true, groupId: group.id };
  } catch {
    return { success: false, error: 'Error inesperado al crear el grupo.' };
  }
}

export async function updateAdminGuestGroup(
  input: UpdateAdminGroupInput
): Promise<{ success: boolean; error?: string }> {
  if (!input.name?.trim()) {
    return { success: false, error: 'El nombre del grupo es obligatorio.' };
  }
  if (!input.maxGuests || input.maxGuests < 1) {
    return { success: false, error: 'El cupo debe ser al menos 1.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: true };
  }

  try {
    const supabase = await createClient();

    const { data: conf } = await supabase
      .from('confirmations')
      .select('status, guests_count')
      .eq('group_id', input.id)
      .maybeSingle();

    if (conf?.status === 'confirmed' && (conf?.guests_count || 0) > input.maxGuests) {
      return {
        success: false,
        error: `Actualmente hay ${conf.guests_count} personas confirmadas. No podés reducir el cupo a ${input.maxGuests} sin modificar primero la confirmación.`,
      };
    }

    const updatePayload: Record<string, unknown> = {
      name: input.name.trim(),
      max_guests: input.maxGuests,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
      personal_message: input.personalMessage?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('guest_groups')
      .update(updatePayload)
      .eq('id', input.id);

    if (error) {
      return { success: false, error: 'No se pudo actualizar el grupo.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Error inesperado al actualizar el grupo.' };
  }
}

export async function deleteAdminGuestGroup(
  groupId: string
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('guest_groups').delete().eq('id', groupId);

    if (error) {
      return { success: false, error: 'No se pudo eliminar el grupo.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Error inesperado al eliminar el grupo.' };
  }
}

export async function addGuestPerson(
  groupId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!name?.trim()) return { success: false, error: 'El nombre es obligatorio.' };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return { success: true };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('guests').insert({
      group_id: groupId,
      name: name.trim(),
    });

    if (error) return { success: false, error: 'No se pudo agregar el invitado.' };
    return { success: true };
  } catch {
    return { success: false, error: 'Error inesperado al agregar el invitado.' };
  }
}

export async function removeGuestPerson(
  guestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return { success: true };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('guests').delete().eq('id', guestId);

    if (error) return { success: false, error: 'No se pudo quitar el invitado.' };
    return { success: true };
  } catch {
    return { success: false, error: 'Error inesperado al quitar el invitado.' };
  }
}

export async function importCsvGuestGroups(
  eventId: string,
  rows: CsvValidatedRow[]
): Promise<{ success: boolean; importedGroupsCount: number; importedGuestsCount: number; error?: string }> {
  const validRows = rows.filter((r) => r.isValid);
  if (validRows.length === 0) {
    return { success: false, importedGroupsCount: 0, importedGuestsCount: 0, error: 'No hay filas válidas para importar.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const uniqueGroups = new Set(validRows.map((r) => r.groupName.toLowerCase()));
    return { success: true, importedGroupsCount: uniqueGroups.size, importedGuestsCount: validRows.length };
  }

  try {
    const supabase = await createClient();

    const groupsMap = new Map<string, { maxGuests: number; phone?: string; guests: string[] }>();

    validRows.forEach((r) => {
      const gName = r.groupName.trim();
      const existing = groupsMap.get(gName);
      if (existing) {
        existing.maxGuests = Math.max(existing.maxGuests, r.maxGuests);
        if (r.phone && !existing.phone) existing.phone = r.phone;
        if (r.fullName) existing.guests.push(r.fullName);
      } else {
        groupsMap.set(gName, {
          maxGuests: r.maxGuests,
          phone: r.phone || undefined,
          guests: r.fullName ? [r.fullName] : [],
        });
      }
    });

    let totalImportedGroups = 0;
    let totalImportedGuests = 0;

    for (const [groupName, data] of groupsMap.entries()) {
      const { data: existingGroup } = await supabase
        .from('guest_groups')
        .select('id')
        .eq('event_id', eventId)
        .ilike('name', groupName)
        .maybeSingle();

      let targetGroupId = existingGroup?.id;

      if (!targetGroupId) {
        const token = generateToken();
        const { data: newGroup, error: groupErr } = await supabase
          .from('guest_groups')
          .insert({
            event_id: eventId,
            name: groupName,
            token,
            max_guests: data.maxGuests,
            phone: data.phone || null,
          })
          .select('id')
          .single();

        if (groupErr || !newGroup) continue;
        targetGroupId = newGroup.id;
        totalImportedGroups++;
      }

      if (targetGroupId && data.guests.length > 0) {
        const guestsPayload = data.guests.map((gName) => ({
          group_id: targetGroupId!,
          name: gName,
        }));
        await supabase.from('guests').insert(guestsPayload);
        totalImportedGuests += guestsPayload.length;
      }
    }

    return {
      success: true,
      importedGroupsCount: totalImportedGroups,
      importedGuestsCount: totalImportedGuests,
    };
  } catch {
    return { success: false, importedGroupsCount: 0, importedGuestsCount: 0, error: 'Error inesperado durante la importación.' };
  }
}

/**
 * Duplica un grupo de invitados generando un nuevo token aleatorio sin confirmación previa (Punto 15 del Hito 8).
 */
export async function duplicateAdminGuestGroup(
  groupId: string
): Promise<{ success: boolean; groupId?: string; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const demoGroups = loadDemoGuestGroups();
    const demoOrig = demoGroups.find((g) => g.id === groupId) || demoGroups[0];
    return { success: true, groupId: `demo-dup-${demoOrig?.id || 'new'}` };
  }

  try {
    const supabase = await createClient();

    const { data: original, error: origErr } = await supabase
      .from('guest_groups')
      .select(`
        event_id, name, max_guests, phone, email, notes, personal_message,
        guests ( name )
      `)
      .eq('id', groupId)
      .maybeSingle();

    if (origErr || !original) {
      return { success: false, error: 'No se encontró el grupo a duplicar.' };
    }

    const rawOrig = original as unknown as {
      event_id: string;
      name: string;
      max_guests: number;
      phone: string | null;
      email: string | null;
      notes: string | null;
      personal_message: string | null;
      guests: Array<{ name: string }>;
    };

    const newToken = generateToken();
    const newName = `${rawOrig.name} (Copia)`;

    const { data: newGroup, error: insertErr } = await supabase
      .from('guest_groups')
      .insert({
        event_id: rawOrig.event_id,
        name: newName,
        token: newToken,
        max_guests: rawOrig.max_guests,
        phone: rawOrig.phone,
        email: rawOrig.email,
        notes: rawOrig.notes,
        personal_message: rawOrig.personal_message,
      })
      .select('id')
      .single();

    if (insertErr || !newGroup) {
      return { success: false, error: 'Error al insertar el grupo duplicado.' };
    }

    if (rawOrig.guests && rawOrig.guests.length > 0) {
      const guestsPayload = rawOrig.guests.map((g) => ({
        group_id: newGroup.id,
        name: g.name,
      }));
      await supabase.from('guests').insert(guestsPayload);
    }

    return { success: true, groupId: newGroup.id };
  } catch {
    return { success: false, error: 'Error inesperado al duplicar el grupo.' };
  }
}


