'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminUser } from './auth';
import type { AdminEventSummary, AdminEventStats, CreateEventInput, UpdateEventInput } from './types';
import type { EventRow } from '@/types/database';
import { slugify } from '@/lib/utils/slug';
import {
  getDemoEventById,
  getDemoEventsList,
  updateDemoEvent,
  createDemoEvent,
} from '@/lib/events/demo-store';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignorar si se ejecuta fuera del contexto de una petición Next.js
  }
}

export async function getAdminEvents(): Promise<AdminEventSummary[]> {
  const user = await getCurrentAdminUser();
  if (!user) return [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return getDemoEventsList();
  }

  try {
    const supabase = await createClient();

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id, slug, name, title, type, template_id, template_version, status, date, start_time, location, address,
        guest_groups (
          id, max_guests,
          confirmations ( status, guests_count )
        )
      `)
      .order('created_at', { ascending: false });

    if (error || !events) {
      return getDemoEventsList();
    }

    return (events as unknown as Array<{
      id: string;
      slug: string;
      name: string;
      title: string;
      type: string;
      template_id: string | null;
      template_version: string | null;
      status: string;
      date: string | null;
      start_time: string | null;
      location: string | null;
      address: string | null;
      guest_groups: Array<{
        id: string;
        max_guests: number;
        confirmations: Array<{ status: string; guests_count: number | null }> | null;
      }>;
    }>).map((e) => {
      const groups = e.guest_groups || [];
      const totalGroups = groups.length;
      let confirmedGroups = 0;
      let pendingGroups = 0;
      let declinedGroups = 0;
      let totalMaxGuests = 0;
      let confirmedPersons = 0;

      groups.forEach((g) => {
        totalMaxGuests += g.max_guests || 0;
        const conf = Array.isArray(g.confirmations) ? g.confirmations[0] : g.confirmations;
        const status = conf?.status || 'pending';

        if (status === 'confirmed') {
          confirmedGroups++;
          confirmedPersons += conf?.guests_count || 0;
        } else if (status === 'declined') {
          declinedGroups++;
        } else {
          pendingGroups++;
        }
      });

      return {
        id: e.id,
        slug: e.slug,
        name: e.name,
        title: e.title,
        type: e.type,
        templateId: e.template_id || 'default',
        templateVersion: e.template_version || '1.0.0',
        status: e.status as AdminEventSummary['status'],
        date: e.date,
        startTime: e.start_time,
        location: e.location,
        address: e.address,
        totalGroups,
        confirmedGroups,
        pendingGroups,
        declinedGroups,
        totalMaxGuests,
        confirmedPersons,
        remainingCapacity: Math.max(0, totalMaxGuests - confirmedPersons),
      };
    });
  } catch {
    return getDemoEventsList();
  }
}

export async function getAdminEventById(
  eventId: string
): Promise<{ event: EventRow | null; stats: AdminEventStats }> {
  const defaultStats: AdminEventStats = {
    groups: { total: 0, confirmed: 0, pending: 0, declined: 0 },
    persons: { maxCapacity: 0, confirmedPersons: 0, remainingCapacity: 0 },
    dietary: {
      summary: [
        { key: 'none', label: 'Ninguna', count: 0 },
        { key: 'vegetarian', label: 'Vegetariano/a', count: 0 },
        { key: 'vegan', label: 'Vegano/a', count: 0 },
        { key: 'celiac', label: 'Celíaco/a', count: 0 },
        { key: 'other', label: 'Otras', count: 0 },
      ],
      details: [],
    },
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const demoEvent = getDemoEventById(eventId) || getDemoEventById('11111111-1111-1111-1111-111111111111');
    if (!demoEvent) {
      return { event: null, stats: defaultStats };
    }
    return {
      event: demoEvent,
      stats: {
        groups: {
          total: 2,
          confirmed: 1,
          pending: 1,
          declined: 0,
        },
        persons: {
          maxCapacity: 7,
          confirmedPersons: 4,
          remainingCapacity: 3,
        },
        dietary: {
          summary: [
            { key: 'none', label: 'Ninguna', count: 3 },
            { key: 'vegetarian', label: 'Vegetariano/a', count: 1 },
            { key: 'vegan', label: 'Vegano/a', count: 0 },
            { key: 'celiac', label: 'Celíaco/a', count: 0 },
            { key: 'other', label: 'Otras', count: 0 },
          ],
          details: [
            { groupName: 'Familia Pérez', attendeeName: 'María Pérez', restriction: 'Vegetariano/a' },
          ],
        },
      },
    };
  }

  try {
    const supabase = await createClient();

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (eventError || !event) {
      return { event: null, stats: defaultStats };
    }

    const { data: groups } = await supabase
      .from('guest_groups')
      .select(`
        id, name, max_guests,
        confirmations (
          id, status, guests_count,
          attendees ( id, name, dietary_restriction )
        )
      `)
      .eq('event_id', eventId);

    const groupList = (groups || []) as unknown as Array<{
      id: string;
      name: string;
      max_guests: number;
      confirmations: Array<{
        id: string;
        status: string;
        guests_count: number | null;
        attendees: Array<{ id: string; name: string; dietary_restriction: string | null }>;
      }> | null;
    }>;

    let confirmedGroups = 0;
    let pendingGroups = 0;
    let declinedGroups = 0;
    let maxCapacity = 0;
    let confirmedPersons = 0;

    const dietaryCounts: Record<string, number> = {
      none: 0,
      vegetarian: 0,
      vegan: 0,
      celiac: 0,
      other: 0,
    };
    const dietaryDetails: AdminEventStats['dietary']['details'] = [];

    groupList.forEach((g) => {
      maxCapacity += g.max_guests || 0;
      const conf = Array.isArray(g.confirmations) ? g.confirmations[0] : g.confirmations;
      const status = conf?.status || 'pending';

      if (status === 'confirmed') {
        confirmedGroups++;
        confirmedPersons += conf?.guests_count || 0;

        (conf?.attendees || []).forEach((att) => {
          const rawDietary = (att.dietary_restriction || 'none').toLowerCase();
          if (rawDietary === 'vegetarian' || rawDietary.includes('vegetar')) {
            dietaryCounts.vegetarian++;
            dietaryDetails.push({ groupName: g.name, attendeeName: att.name, restriction: 'Vegetariano/a' });
          } else if (rawDietary === 'vegan' || rawDietary.includes('vegan')) {
            dietaryCounts.vegan++;
            dietaryDetails.push({ groupName: g.name, attendeeName: att.name, restriction: 'Vegano/a' });
          } else if (rawDietary === 'celiac' || rawDietary.includes('cel')) {
            dietaryCounts.celiac++;
            dietaryDetails.push({ groupName: g.name, attendeeName: att.name, restriction: 'Celíaco/a' });
          } else if (rawDietary === 'none' || !rawDietary) {
            dietaryCounts.none++;
          } else {
            dietaryCounts.other++;
            dietaryDetails.push({ groupName: g.name, attendeeName: att.name, restriction: att.dietary_restriction || 'Otra' });
          }
        });
      } else if (status === 'declined') {
        declinedGroups++;
      } else {
        pendingGroups++;
      }
    });

    return {
      event: event as EventRow,
      stats: {
        groups: {
          total: groupList.length,
          confirmed: confirmedGroups,
          pending: pendingGroups,
          declined: declinedGroups,
        },
        persons: {
          maxCapacity,
          confirmedPersons,
          remainingCapacity: Math.max(0, maxCapacity - confirmedPersons),
        },
        dietary: {
          summary: [
            { key: 'none', label: 'Ninguna', count: dietaryCounts.none },
            { key: 'vegetarian', label: 'Vegetariano/a', count: dietaryCounts.vegetarian },
            { key: 'vegan', label: 'Vegano/a', count: dietaryCounts.vegan },
            { key: 'celiac', label: 'Celíaco/a', count: dietaryCounts.celiac },
            { key: 'other', label: 'Otras', count: dietaryCounts.other },
          ],
          details: dietaryDetails,
        },
      },
    };
  } catch {
    return { event: null, stats: defaultStats };
  }
}

export async function createEvent(
  input: CreateEventInput
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  if (!input.name || !input.title || !input.slug) {
    return { success: false, error: 'Nombre, título y enlace personalizado (slug) son obligatorios.' };
  }

  const cleanSlug = slugify(input.slug);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const eventId = createDemoEvent(input);
    safeRevalidatePath('/admin/events');
    return { success: true, eventId };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: input.name.trim(),
        title: input.title.trim(),
        slug: cleanSlug,
        type: input.type || 'other',
        status: input.status || 'draft',
        template_id: input.templateId || 'default',
        template_version: input.templateVersion || '1.0.0',
        date: input.date || null,
        start_time: input.startTime || null,
        location: input.location || null,
        address: input.address || null,
        maps_url: input.mapsUrl || null,
        waze_url: input.wazeUrl || null,
        dress_code: input.dressCode || null,
        gifts_text: input.giftsText || null,
        memoroo_url: input.memorooUrl || null,
        memoroo_qr_url: input.memorooQrUrl || null,
        cover_image: input.coverImage || null,
      })
      .select('id')
      .single();

    if (error || !data) {
      if (error?.message?.includes('duplicate key') || error?.message?.includes('events_slug_key')) {
        return { success: false, error: 'Ya existe un evento con este slug. Por favor elegí otro.' };
      }
      return { success: false, error: 'No se pudo crear el evento. Por favor intentá nuevamente.' };
    }

    safeRevalidatePath('/admin/events');
    return { success: true, eventId: data.id };
  } catch {
    return { success: false, error: 'Error inesperado al crear el evento.' };
  }
}

export async function updateEvent(
  input: UpdateEventInput
): Promise<{ success: boolean; error?: string }> {
  if (!input.id) return { success: false, error: 'ID de evento faltante.' };

  // Siempre actualizamos el demo store para persistencia y soporte inmediato
  updateDemoEvent(input);

  if (input.slug) {
    safeRevalidatePath(`/invitacion/${input.slug}`);
  }
  safeRevalidatePath(`/admin/events/${input.id}/editor`);
  safeRevalidatePath(`/admin/events/${input.id}`);
  safeRevalidatePath('/admin/events');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.type !== undefined) updateData.type = input.type;
    if (input.templateId !== undefined) updateData.template_id = input.templateId;
    if (input.templateVersion !== undefined) updateData.template_version = input.templateVersion;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.date !== undefined) updateData.date = input.date || null;
    if (input.startTime !== undefined) updateData.start_time = input.startTime || null;
    if (input.location !== undefined) updateData.location = input.location || null;
    if (input.address !== undefined) updateData.address = input.address || null;
    if (input.mapsUrl !== undefined) updateData.maps_url = input.mapsUrl || null;
    if (input.wazeUrl !== undefined) updateData.waze_url = input.wazeUrl || null;
    if (input.dressCode !== undefined) updateData.dress_code = input.dressCode || null;
    if (input.giftsText !== undefined) updateData.gifts_text = input.giftsText || null;
    if (input.memorooUrl !== undefined) updateData.memoroo_url = input.memorooUrl || null;
    if (input.memorooQrUrl !== undefined) updateData.memoroo_qr_url = input.memorooQrUrl || null;
    if (input.coverImage !== undefined) updateData.cover_image = input.coverImage || null;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle || null;
    if (input.welcomeText !== undefined) updateData.welcome_text = input.welcomeText || null;
    if (input.schedule !== undefined) updateData.schedule = input.schedule || [];
    if (input.designConfig !== undefined) updateData.design_config = input.designConfig || {};
    if (input.sectionConfig !== undefined) updateData.section_config = input.sectionConfig || {};
    if (input.whatsappTemplate !== undefined) updateData.whatsapp_template = input.whatsappTemplate || null;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase.from('events').update(updateData).eq('id', input.id);

    if (error) {
      return { success: false, error: 'No se pudieron guardar los cambios del evento.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Error inesperado al actualizar el evento.' };
  }
}

export async function duplicateEvent(
  eventId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  if (!eventId) return { success: false, error: 'ID de evento faltante.' };

  const { event: original } = await getAdminEventById(eventId);
  if (!original) {
    return { success: false, error: 'No se encontró el evento original a duplicar.' };
  }

  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const newSlug = `${original.slug}-copia-${randomSuffix}`.substring(0, 50);
  const newName = `${original.name} (Copia)`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const newId = createDemoEvent({
      name: newName,
      title: original.title,
      slug: newSlug,
      type: original.type,
      templateId: original.template_id,
      templateVersion: original.template_version || undefined,
      status: 'draft',
      date: original.date || undefined,
      startTime: original.start_time || undefined,
      location: original.location || undefined,
      address: original.address || undefined,
      mapsUrl: original.maps_url || undefined,
      wazeUrl: original.waze_url || undefined,
      dressCode: original.dress_code || undefined,
      giftsText: original.gifts_text || undefined,
      coverImage: original.cover_image || undefined,
    });
    safeRevalidatePath('/admin/events');
    return { success: true, eventId: newId };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: newName,
        title: original.title,
        slug: newSlug,
        subtitle: original.subtitle || null,
        welcome_text: original.welcome_text || null,
        type: original.type,
        template_id: original.template_id,
        template_version: original.template_version || '1.0.0',
        status: 'draft', // Siempre arranca en borrador
        date: original.date,
        start_time: original.start_time,
        location: original.location,
        address: original.address,
        maps_url: original.maps_url,
        waze_url: original.waze_url,
        dress_code: original.dress_code,
        gifts_text: original.gifts_text,
        schedule: original.schedule || [],
        design_config: original.design_config || {},
        section_config: original.section_config || {},
      })
      .select('id')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Error al duplicar el evento.' };
    }

    return { success: true, eventId: data.id };
  } catch {
    return { success: false, error: 'Error inesperado al duplicar el evento.' };
  }
}
