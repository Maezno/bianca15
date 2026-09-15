import fs from 'fs';
import path from 'path';
import type { AdminGuestGroupItem } from '@/lib/admin/types';
import { generateToken } from '@/lib/utils/token';

const STORE_FILE = path.join(process.cwd(), '.demo-guests-data.json');

const INITIAL_GROUPS: AdminGuestGroupItem[] = [
  {
    id: '11111111-0001-0001-0001-000000000001',
    event_id: '11111111-1111-1111-1111-111111111111',
    name: 'Familia Pérez',
    token: 'perez-test1',
    max_guests: 5,
    phone: '1122334455',
    email: 'perez@ejemplo.com',
    notes: 'Mesa principal',
    personal_message: '¡Esperamos contar con ustedes en esta noche tan especial!',
    created_at: '2026-08-15T12:00:00Z',
    updated_at: '2026-08-15T12:00:00Z',
    invitationUrl: '/invitacion/bianca-15/perez-test1',
    guests: [
      { id: 'g1', group_id: '11111111-0001-0001-0001-000000000001', name: 'Juan Pérez', created_at: '', updated_at: '' },
      { id: 'g2', group_id: '11111111-0001-0001-0001-000000000001', name: 'María Pérez', created_at: '', updated_at: '' },
      { id: 'g3', group_id: '11111111-0001-0001-0001-000000000001', name: 'Pedro Pérez', created_at: '', updated_at: '' },
      { id: 'g4', group_id: '11111111-0001-0001-0001-000000000001', name: 'Ana Pérez', created_at: '', updated_at: '' },
    ],
    confirmation: {
      id: 'c1',
      group_id: '11111111-0001-0001-0001-000000000001',
      status: 'confirmed',
      guests_count: 4,
      comment: 'Llegaremos a las 21:30.',
      confirmed_at: '2026-11-15T20:00:00Z',
      created_at: '',
      updated_at: '',
    },
    attendees: [
      { id: 'a1', confirmation_id: 'c1', name: 'Juan Pérez', dietary_restriction: 'none', created_at: '', updated_at: '' },
      { id: 'a2', confirmation_id: 'c1', name: 'María Pérez', dietary_restriction: 'vegetarian', created_at: '', updated_at: '' },
      { id: 'a3', confirmation_id: 'c1', name: 'Pedro Pérez', dietary_restriction: 'celiac', created_at: '', updated_at: '' },
      { id: 'a4', confirmation_id: 'c1', name: 'Ana Pérez', dietary_restriction: 'none', created_at: '', updated_at: '' },
    ],
  },
  {
    id: '11111111-0002-0002-0002-000000000002',
    event_id: '11111111-1111-1111-1111-111111111111',
    name: 'Familia García',
    token: 'garcia-test2',
    max_guests: 2,
    phone: '1199887766',
    email: 'garcia@ejemplo.com',
    notes: null,
    personal_message: null,
    created_at: '2026-08-16T12:00:00Z',
    updated_at: '2026-08-16T12:00:00Z',
    invitationUrl: '/invitacion/bianca-15/garcia-test2',
    guests: [
      { id: 'g5', group_id: '11111111-0002-0002-0002-000000000002', name: 'Juan García', created_at: '', updated_at: '' },
      { id: 'g6', group_id: '11111111-0002-0002-0002-000000000002', name: 'Laura Gómez', created_at: '', updated_at: '' },
    ],
    confirmation: null,
    attendees: [],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __DEMO_GUESTS_STORE__: AdminGuestGroupItem[] | undefined;
}

export function loadDemoGuestGroups(): AdminGuestGroupItem[] {
  if (globalThis.__DEMO_GUESTS_STORE__) {
    return globalThis.__DEMO_GUESTS_STORE__;
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__DEMO_GUESTS_STORE__ = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[demo-guests-store] Error leyendo archivo demo, usando defaults:', err);
  }

  globalThis.__DEMO_GUESTS_STORE__ = [...INITIAL_GROUPS];
  saveDemoGuestGroups(globalThis.__DEMO_GUESTS_STORE__);
  return globalThis.__DEMO_GUESTS_STORE__;
}

export function saveDemoGuestGroups(groups: AdminGuestGroupItem[]) {
  globalThis.__DEMO_GUESTS_STORE__ = groups;
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(groups, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[demo-guests-store] Error guardando archivo demo:', err);
  }
}

export interface AddPublicRsvpInput {
  eventId: string;
  eventSlug?: string;
  type: 'individual' | 'family';
  name: string; // Nombre del grupo o de la persona
  members: string[]; // Nombres de los integrantes
  status: 'confirmed' | 'declined';
  phone?: string;
  comment?: string;
}

export function addDemoGuestGroupFromRsvp(input: AddPublicRsvpInput): AdminGuestGroupItem {
  const groups = loadDemoGuestGroups();
  const groupId = `demo-grp-${Date.now()}`;
  const token = generateToken();
  const confirmationId = `demo-conf-${Date.now()}`;
  const now = new Date().toISOString();

  const count = input.status === 'confirmed' ? input.members.length : 0;
  const maxGuests = Math.max(1, input.members.length);

  const guestItems = input.members.map((memberName, idx) => ({
    id: `demo-gst-${Date.now()}-${idx}`,
    group_id: groupId,
    name: memberName.trim(),
    created_at: now,
    updated_at: now,
  }));

  const attendeeItems = input.status === 'confirmed'
    ? input.members.map((memberName, idx) => ({
        id: `demo-att-${Date.now()}-${idx}`,
        confirmation_id: confirmationId,
        name: memberName.trim(),
        dietary_restriction: 'none',
        created_at: now,
        updated_at: now,
      }))
    : [];

  const newGroup: AdminGuestGroupItem = {
    id: groupId,
    event_id: input.eventId,
    name: input.name.trim(),
    token,
    max_guests: maxGuests,
    phone: input.phone?.trim() || null,
    email: null,
    notes: input.type === 'family' ? 'Confirmado como Familia / Grupo' : 'Confirmado individual',
    personal_message: null,
    created_at: now,
    updated_at: now,
    invitationUrl: `/invitacion/${input.eventSlug || 'bianca-15'}/${token}`,
    guests: guestItems,
    confirmation: {
      id: confirmationId,
      group_id: groupId,
      status: input.status,
      guests_count: count,
      comment: input.comment?.trim() || null,
      confirmed_at: now,
      created_at: now,
      updated_at: now,
    },
    attendees: attendeeItems,
  };

  groups.unshift(newGroup);
  saveDemoGuestGroups(groups);
  return newGroup;
}
