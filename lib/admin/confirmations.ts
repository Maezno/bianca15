'use server';

import { createClient } from '@/lib/supabase/server';
import { generateCsvExport } from './csv';

export interface AdminConfirmationRow {
  groupId: string;
  groupName: string;
  token: string;
  maxGuests: number;
  phone: string | null;
  status: 'pending' | 'confirmed' | 'declined';
  confirmedCount: number;
  comment: string | null;
  confirmedAt: string | null;
  attendees: Array<{
    name: string;
    dietary: string;
  }>;
}

const DEMO_CONFIRMATIONS: AdminConfirmationRow[] = [
  {
    groupId: '11111111-0001-0001-0001-000000000001',
    groupName: 'Familia Pérez',
    token: 'perez-test1',
    maxGuests: 5,
    phone: '1122334455',
    status: 'confirmed',
    confirmedCount: 4,
    comment: 'Llegaremos a las 21:30.',
    confirmedAt: '2026-11-15T20:00:00Z',
    attendees: [
      { name: 'Juan Pérez', dietary: 'Ninguna' },
      { name: 'María Pérez', dietary: 'Vegetariano/a' },
      { name: 'Pedro Pérez', dietary: 'Celíaco/a' },
      { name: 'Ana Pérez', dietary: 'Ninguna' },
    ],
  },
  {
    groupId: '11111111-0002-0002-0002-000000000002',
    groupName: 'Familia García',
    token: 'garcia-test2',
    maxGuests: 2,
    phone: '1199887766',
    status: 'pending',
    confirmedCount: 0,
    comment: null,
    confirmedAt: null,
    attendees: [],
  },
];

export async function getAdminConfirmations(
  eventId: string
): Promise<AdminConfirmationRow[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return DEMO_CONFIRMATIONS;
  }

  try {
    const supabase = await createClient();

    const { data: groups, error } = await supabase
      .from('guest_groups')
      .select(`
        id, name, token, max_guests, phone,
        confirmations (
          status, guests_count, comment, confirmed_at,
          attendees ( name, dietary_restriction )
        )
      `)
      .eq('event_id', eventId)
      .order('name', { ascending: true });

    if (error || !groups) {
      return DEMO_CONFIRMATIONS;
    }

    return (groups as unknown as Array<{
      id: string;
      name: string;
      token: string;
      max_guests: number;
      phone: string | null;
      confirmations: Array<{
        status: string;
        guests_count: number | null;
        comment: string | null;
        confirmed_at: string | null;
        attendees: Array<{ name: string; dietary_restriction: string | null }>;
      }> | null;
    }>).map((g) => {
      const conf = Array.isArray(g.confirmations) ? g.confirmations[0] : g.confirmations;
      const status = (conf?.status as AdminConfirmationRow['status']) || 'pending';
      const confirmedCount = conf?.guests_count || 0;
      const attendees = (conf?.attendees || []).map((a) => ({
        name: a.name,
        dietary: a.dietary_restriction || 'Ninguna',
      }));

      return {
        groupId: g.id,
        groupName: g.name,
        token: g.token,
        maxGuests: g.max_guests,
        phone: g.phone,
        status,
        confirmedCount,
        comment: conf?.comment || null,
        confirmedAt: conf?.confirmed_at || null,
        attendees,
      };
    });
  } catch {
    return DEMO_CONFIRMATIONS;
  }
}

export async function exportEventCsv(eventId: string): Promise<string> {
  const confirmations = await getAdminConfirmations(eventId);

  const exportData = confirmations.map((c) => ({
    groupName: c.groupName,
    maxGuests: c.maxGuests,
    guestName: c.attendees.length > 0 ? c.attendees.map((a) => a.name).join(', ') : c.groupName,
    phone: c.phone,
    status: c.status,
    confirmedCount: c.confirmedCount,
    attendees: c.attendees.map((a) => a.name).join(', '),
    dietary: c.attendees
      .filter((a) => a.dietary && a.dietary.toLowerCase() !== 'ninguna' && a.dietary.toLowerCase() !== 'none')
      .map((a) => `${a.name}: ${a.dietary}`)
      .join('; '),
    comment: c.comment,
    confirmedAt: c.confirmedAt,
  }));

  return generateCsvExport(exportData);
}
