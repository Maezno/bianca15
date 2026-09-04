import fs from 'fs';
import path from 'path';
import type { EventRow } from '@/types/database';
import type { PublicEvent, EventDesignConfig, EventSectionConfig, ScheduleItem } from '@/types/event';
import type { AdminEventSummary, UpdateEventInput, CreateEventInput } from '@/lib/admin/types';
import { slugify } from '@/lib/utils/slug';

const STORE_FILE = path.join(process.cwd(), '.demo-events-data.json');

const INITIAL_EVENTS: EventRow[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'bianca-15',
    name: 'Bianca - 15 años',
    title: 'Mis 15 años',
    subtitle: 'Te invito a compartir una noche inolvidable',
    welcome_text: 'Hay momentos en la vida que son mágicos e inolvidables. Gracias por acompañarme a celebrar mis 15 años.',
    type: '15_years',
    template_id: 'wonderland',
    template_version: '1.0.0',
    status: 'published',
    date: '2026-11-21',
    start_time: '21:00',
    location: 'Salón Las Camelias',
    address: 'Av. Libertador 4500, Buenos Aires',
    maps_url: 'https://maps.google.com/?q=Salon+Las+Camelias',
    waze_url: 'https://waze.com/ul?q=Salon+Las+Camelias',
    dress_code: 'Elegante Sport / Formal',
    gifts_text: 'Tu presencia es nuestro mejor regalo. Si deseás hacernos un presente, podés colaborar con nuestra alcancía.',
    memoroo_url: 'https://memoroo.app/e/bianca15',
    memoroo_qr_url: 'https://memoroo.app/qr/bianca15.png',
    cover_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop',
    schedule: [
      { id: '1', time: '21:00', title: 'Recepción', description: 'Cocktail de bienvenida' },
      { id: '2', time: '22:00', title: 'Entrada de Bianca', description: 'Momento emotivo' },
      { id: '3', time: '22:30', title: 'Cena Principal', description: 'Banquete y brindis' },
      { id: '4', time: '00:00', title: 'Apertura de Pista', description: '¡Fiesta hasta el amanecer!' },
    ],
    section_config: {
      order: ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'photos', 'confirmation', 'share', 'footer'],
      enabled: {
        hero: true,
        welcome: true,
        countdown: true,
        date: true,
        location: true,
        schedule: true,
        dress_code: true,
        gifts: true,
        photos: false,
        confirmation: true,
        share: true,
        footer: true,
      },
    },
    design_config: {
      colors: {
        primary: '#c5a028',
        secondary: '#8b0000',
        background: '#0a0a0f',
        surface: '#14141d',
        text: '#f8fafc',
        accent: '#dc2626',
      },
      typography: {
        headingFont: 'Playfair Display, Georgia, serif',
        bodyFont: 'Inter, system-ui, sans-serif',
      },
    },
    whatsapp_template: null,
    created_at: '2026-08-15T12:00:00Z',
    updated_at: '2026-08-15T12:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'juan-y-maria',
    name: 'Juan y María',
    title: 'Nuestra Boda',
    subtitle: '¡Nos casamos!',
    welcome_text: 'Queremos compartir el día más importante de nuestras vidas con vos.',
    type: 'wedding',
    template_id: 'elegant',
    template_version: '1.0.0',
    status: 'published',
    date: '2026-12-12',
    start_time: '19:30',
    location: 'Quinta Los Robles',
    address: 'Ruta 8 Km 54, Pilar',
    maps_url: 'https://maps.google.com/?q=Quinta+Los+Robles+Pilar',
    waze_url: 'https://waze.com/ul?q=Quinta+Los+Robles+Pilar',
    dress_code: 'Black Tie / Gala',
    gifts_text: 'CBU: 0000003100010000000000 - Alias: BODA.JUAN.MARIA',
    memoroo_url: 'https://memoroo.app/e/juanymaria',
    memoroo_qr_url: 'https://memoroo.app/qr/juanymaria.png',
    cover_image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80&auto=format&fit=crop',
    schedule: [
      { id: '1', time: '19:30', title: 'Ceremonia Civil y Religiosa', description: 'En el parque principal' },
      { id: '2', time: '21:00', title: 'Cocktail y Cena', description: 'Salón principal' },
      { id: '3', time: '23:30', title: 'Vals y Fiesta', description: 'Apertura de la pista' },
    ],
    section_config: {
      order: ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'photos', 'confirmation', 'share', 'footer'],
      enabled: {
        hero: true,
        welcome: true,
        countdown: true,
        date: true,
        location: true,
        schedule: true,
        dress_code: true,
        gifts: true,
        photos: false,
        confirmation: true,
        share: true,
        footer: true,
      },
    },
    design_config: {},
    whatsapp_template: null,
    created_at: '2026-08-16T12:00:00Z',
    updated_at: '2026-08-16T12:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'evento-draft',
    name: 'Evento en Borrador',
    title: 'Gran Fiesta Secreta',
    subtitle: 'Aún no publicado',
    welcome_text: 'Este evento todavía está en preparación y no debe ser público.',
    type: 'birthday',
    template_id: 'wonderland',
    template_version: '1.0.0',
    status: 'draft',
    date: '2027-01-15',
    start_time: '20:00',
    location: 'Salón Secreto',
    address: 'Calle Falsa 123',
    maps_url: '',
    waze_url: '',
    dress_code: 'Informal',
    gifts_text: '',
    memoroo_url: '',
    memoroo_qr_url: '',
    cover_image: '',
    schedule: [],
    section_config: {
      order: ['hero', 'welcome', 'countdown', 'date', 'location', 'share', 'footer'],
      enabled: {
        hero: true,
        welcome: true,
        countdown: true,
        date: true,
        location: true,
        share: true,
        footer: true,
      },
    },
    design_config: {},
    whatsapp_template: null,
    created_at: '2026-08-17T12:00:00Z',
    updated_at: '2026-08-17T12:00:00Z',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __DEMO_EVENTS_STORE__: EventRow[] | undefined;
}

function loadStore(): EventRow[] {
  if (globalThis.__DEMO_EVENTS_STORE__) {
    return globalThis.__DEMO_EVENTS_STORE__;
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__DEMO_EVENTS_STORE__ = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[demo-store] No se pudo leer archivo de eventos demo, usando defaults:', err);
  }

  globalThis.__DEMO_EVENTS_STORE__ = [...INITIAL_EVENTS];
  saveStore(globalThis.__DEMO_EVENTS_STORE__);
  return globalThis.__DEMO_EVENTS_STORE__;
}

function saveStore(events: EventRow[]) {
  globalThis.__DEMO_EVENTS_STORE__ = events;
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[demo-store] No se pudo escribir archivo de eventos demo:', err);
  }
}

export function toPublicEvent(row: EventRow): PublicEvent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    subtitle: row.subtitle || undefined,
    welcomeText: row.welcome_text || undefined,
    type: row.type,
    templateId: row.template_id || 'default',
    templateVersion: row.template_version || '1.0.0',
    status: row.status as 'draft' | 'published' | 'archived',
    date: row.date || '',
    startTime: row.start_time || '',
    location: row.location || '',
    address: row.address || '',
    mapsUrl: row.maps_url || '',
    wazeUrl: row.waze_url || '',
    dressCode: row.dress_code || '',
    giftsText: row.gifts_text || '',
    memorooUrl: row.memoroo_url || '',
    memorooQrUrl: row.memoroo_qr_url || '',
    coverImage: row.cover_image || undefined,
    schedule: Array.isArray(row.schedule) ? (row.schedule as unknown as ScheduleItem[]) : undefined,
    designConfig: (row.design_config as unknown as EventDesignConfig) || undefined,
    sectionConfig: (row.section_config as unknown as EventSectionConfig) || undefined,
    whatsappTemplate: row.whatsapp_template || undefined,
  };
}

export function getDemoEventById(idOrSlug: string): EventRow | null {
  const events = loadStore();
  const clean = idOrSlug.trim().toLowerCase();
  return events.find((e) => e.id === clean || e.slug.toLowerCase() === clean) || null;
}

export function getDemoEventBySlug(slug: string): PublicEvent | null {
  const row = getDemoEventById(slug);
  return row ? toPublicEvent(row) : null;
}

export function getDemoEventsList(): AdminEventSummary[] {
  const events = loadStore();
  return events.map((e) => ({
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
    totalGroups: 2,
    confirmedGroups: 1,
    pendingGroups: 1,
    declinedGroups: 0,
    totalMaxGuests: 7,
    confirmedPersons: 4,
    remainingCapacity: 3,
  }));
}

export function updateDemoEvent(input: UpdateEventInput): boolean {
  const events = loadStore();
  const index = events.findIndex((e) => e.id === input.id);
  if (index === -1) return false;

  const current = events[index];
  const updated: EventRow = {
    ...current,
    name: input.name !== undefined ? input.name.trim() : current.name,
    title: input.title !== undefined ? input.title.trim() : current.title,
    slug: input.slug !== undefined ? slugify(input.slug) : current.slug,
    type: input.type !== undefined ? input.type : current.type,
    template_id: input.templateId !== undefined ? input.templateId : current.template_id,
    template_version: input.templateVersion !== undefined ? input.templateVersion : current.template_version,
    status: input.status !== undefined ? input.status : current.status,
    date: input.date !== undefined ? input.date || null : current.date,
    start_time: input.startTime !== undefined ? input.startTime || null : current.start_time,
    location: input.location !== undefined ? input.location || null : current.location,
    address: input.address !== undefined ? input.address || null : current.address,
    maps_url: input.mapsUrl !== undefined ? input.mapsUrl || null : current.maps_url,
    waze_url: input.wazeUrl !== undefined ? input.wazeUrl || null : current.waze_url,
    dress_code: input.dressCode !== undefined ? input.dressCode || null : current.dress_code,
    gifts_text: input.giftsText !== undefined ? input.giftsText || null : current.gifts_text,
    memoroo_url: input.memorooUrl !== undefined ? input.memorooUrl || null : current.memoroo_url,
    memoroo_qr_url: input.memorooQrUrl !== undefined ? input.memorooQrUrl || null : current.memoroo_qr_url,
    cover_image: input.coverImage !== undefined ? input.coverImage || null : current.cover_image,
    subtitle: input.subtitle !== undefined ? input.subtitle || null : current.subtitle,
    welcome_text: input.welcomeText !== undefined ? input.welcomeText || null : current.welcome_text,
    schedule: input.schedule !== undefined ? (input.schedule as unknown as typeof current.schedule) : current.schedule,
    design_config: input.designConfig !== undefined ? (input.designConfig as unknown as typeof current.design_config) : current.design_config,
    section_config: input.sectionConfig !== undefined ? (input.sectionConfig as unknown as typeof current.section_config) : current.section_config,
    whatsapp_template: input.whatsappTemplate !== undefined ? input.whatsappTemplate || null : current.whatsapp_template,
    updated_at: new Date().toISOString(),
  };

  events[index] = updated;
  saveStore(events);
  return true;
}

export function createDemoEvent(input: CreateEventInput): string {
  const events = loadStore();
  const newId = `demo-${Date.now()}`;
  const cleanSlug = slugify(input.slug);

  const newEvent: EventRow = {
    id: newId,
    slug: cleanSlug,
    name: input.name.trim(),
    title: input.title.trim(),
    subtitle: null,
    welcome_text: null,
    type: input.type || 'other',
    template_id: input.templateId || 'default',
    template_version: input.templateVersion || '1.0.0',
    status: input.status || 'draft',
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
    schedule: [],
    section_config: {
      order: ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'confirmation', 'photos', 'share', 'footer'],
      enabled: {
        hero: true,
        welcome: true,
        countdown: true,
        date: true,
        location: true,
        schedule: true,
        dress_code: true,
        gifts: true,
        confirmation: true,
        photos: false,
        share: true,
        footer: true,
      },
    },
    design_config: {},
    whatsapp_template: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  events.unshift(newEvent);
  saveStore(events);
  return newId;
}
