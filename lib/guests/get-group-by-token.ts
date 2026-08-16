import { createClient } from "@/lib/supabase/server";
import { isValidTokenFormat } from "@/lib/utils/token";
import type { PublicGuestGroup } from "@/lib/guests/types";

// Datos locales de demostración para desarrollo y testing de aislamiento
const DEMO_GROUPS: Record<
  string,
  { eventSlug: string; group: PublicGuestGroup }
> = {
  "perez-test1": {
    eventSlug: "bianca-15",
    group: {
      id: "11111111-0001-0001-0001-000000000001",
      eventId: "11111111-1111-1111-1111-111111111111",
      name: "Familia Pérez",
      token: "perez-test1",
      maxGuests: 5,
      guests: [
        { id: "g1", name: "Juan Pérez" },
        { id: "g2", name: "María Pérez" },
        { id: "g3", name: "Pedro Pérez" },
        { id: "g4", name: "Ana Pérez" },
      ],
      confirmation: null,
      event: {
        id: "11111111-1111-1111-1111-111111111111",
        slug: "bianca-15",
        name: "Bianca - 15 años",
        title: "Mis 15 años",
        type: "15_years",
        templateId: "wonderland",
        status: "published",
        date: "2026-11-21",
        startTime: "21:00",
        location: "Salón Las Camelias",
        address: "Av. Libertador 4500, Buenos Aires",
        mapsUrl: "https://maps.google.com/?q=Salon+Las+Camelias",
        wazeUrl: "https://waze.com/ul?q=Salon+Las+Camelias",
        dressCode: "Elegante Sport / Formal",
        giftsText:
          "Tu presencia es nuestro mejor regalo. Si deseás hacernos un presente, podés colaborar con nuestra alcancía.",
        memorooUrl: "https://memoroo.app/e/bianca15",
        memorooQrUrl: "https://memoroo.app/qr/bianca15.png",
      },
    },
  },
  "garcia-test2": {
    eventSlug: "bianca-15",
    group: {
      id: "11111111-0002-0002-0002-000000000002",
      eventId: "11111111-1111-1111-1111-111111111111",
      name: "Familia García",
      token: "garcia-test2",
      maxGuests: 2,
      guests: [
        { id: "g5", name: "Juan García" },
        { id: "g6", name: "Laura Gómez" },
      ],
      confirmation: null,
      event: {
        id: "11111111-1111-1111-1111-111111111111",
        slug: "bianca-15",
        name: "Bianca - 15 años",
        title: "Mis 15 años",
        type: "15_years",
        templateId: "wonderland",
        status: "published",
        date: "2026-11-21",
        startTime: "21:00",
        location: "Salón Las Camelias",
        address: "Av. Libertador 4500, Buenos Aires",
        mapsUrl: "https://maps.google.com/?q=Salon+Las+Camelias",
        wazeUrl: "https://waze.com/ul?q=Salon+Las+Camelias",
        dressCode: "Elegante Sport / Formal",
        giftsText:
          "Tu presencia es nuestro mejor regalo. Si deseás hacernos un presente, podés colaborar con nuestra alcancía.",
        memorooUrl: "https://memoroo.app/e/bianca15",
        memorooQrUrl: "https://memoroo.app/qr/bianca15.png",
      },
    },
  },
  "rodriguez-boda": {
    eventSlug: "juan-y-maria",
    group: {
      id: "22222222-0001-0001-0001-000000000001",
      eventId: "22222222-2222-2222-2222-222222222222",
      name: "Familia Rodríguez",
      token: "rodriguez-boda",
      maxGuests: 4,
      guests: [
        { id: "g7", name: "Roberto Rodríguez" },
        { id: "g8", name: "Carmen Díaz" },
        { id: "g9", name: "Sofía Rodríguez" },
      ],
      confirmation: null,
      event: {
        id: "22222222-2222-2222-2222-222222222222",
        slug: "juan-y-maria",
        name: "Juan y María",
        title: "Nuestra Boda",
        type: "wedding",
        templateId: "elegant",
        status: "published",
        date: "2026-12-12",
        startTime: "19:30",
        location: "Quinta Los Robles",
        address: "Ruta 8 Km 54, Pilar",
        mapsUrl: "https://maps.google.com/?q=Quinta+Los+Robles+Pilar",
        wazeUrl: "https://waze.com/ul?q=Quinta+Los+Robles+Pilar",
        dressCode: "Black Tie / Gala",
        giftsText: "CBU: 0000003100010000000000 - Alias: BODA.JUAN.MARIA",
        memorooUrl: "https://memoroo.app/e/juanymaria",
        memorooQrUrl: "https://memoroo.app/qr/juanymaria.png",
      },
    },
  },
  "carlos-individual": {
    eventSlug: "juan-y-maria",
    group: {
      id: "22222222-0002-0002-0002-000000000002",
      eventId: "22222222-2222-2222-2222-222222222222",
      name: "Carlos Gómez",
      token: "carlos-individual",
      maxGuests: 1,
      guests: [],
      confirmation: null,
      event: {
        id: "22222222-2222-2222-2222-222222222222",
        slug: "juan-y-maria",
        name: "Juan y María",
        title: "Nuestra Boda",
        type: "wedding",
        templateId: "elegant",
        status: "published",
        date: "2026-12-12",
        startTime: "19:30",
        location: "Quinta Los Robles",
        address: "Ruta 8 Km 54, Pilar",
        mapsUrl: "https://maps.google.com/?q=Quinta+Los+Robles+Pilar",
        wazeUrl: "https://waze.com/ul?q=Quinta+Los+Robles+Pilar",
        dressCode: "Black Tie / Gala",
        giftsText: "CBU: 0000003100010000000000 - Alias: BODA.JUAN.MARIA",
        memorooUrl: "https://memoroo.app/e/juanymaria",
        memorooQrUrl: "https://memoroo.app/qr/juanymaria.png",
      },
    },
  },
};

function getLocalDemoGroup(
  token: string,
  eventSlug?: string
): PublicGuestGroup | null {
  const match = DEMO_GROUPS[token];
  if (!match) return null;

  // Validación de aislamiento estricto
  if (eventSlug && match.eventSlug !== eventSlug.trim().toLowerCase()) {
    return null; // Mismatched event -> 404
  }

  return match.group;
}

/**
 * Recupera los datos de un grupo de invitados y su evento asociado.
 *
 * @param token - Token URL-safe del grupo
 * @param eventSlug - (Opcional) Slug del evento para validar aislamiento
 */
export async function getGroupByToken(
  token: string,
  eventSlug?: string
): Promise<PublicGuestGroup | null> {
  if (!isValidTokenFormat(token)) return null;

  const cleanSlug = eventSlug?.trim().toLowerCase() || null;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .rpc("get_invitation_by_token", {
        p_token: token,
        p_slug: cleanSlug ?? undefined,
      })
      .maybeSingle();

    if (error) {
      return getLocalDemoGroup(token, eventSlug);
    }

    if (!data) return getLocalDemoGroup(token, eventSlug);

    const raw = data as Record<string, unknown>;
    const rawEvent = (raw.event as Record<string, unknown>) || {};

    return {
      id: raw.id as string,
      eventId: raw.event_id as string,
      name: raw.name as string,
      token: raw.token as string,
      maxGuests: raw.max_guests as number,
      guests: Array.isArray(raw.guests)
        ? (raw.guests as Array<{ id: string; name: string }>).map((g) => ({
            id: g.id,
            name: g.name,
          }))
        : [],
      confirmation: raw.confirmation
        ? {
            status: (raw.confirmation as { status: string }).status as
              | "pending"
              | "confirmed"
              | "declined",
            guestsCount: (raw.confirmation as { guests_count: number | null })
              .guests_count,
          }
        : null,
      event: {
        id: rawEvent.id as string,
        slug: rawEvent.slug as string,
        name: rawEvent.name as string,
        title: rawEvent.title as string,
        type: (rawEvent.type as string) || "other",
        templateId: (rawEvent.template_id as string) || "default",
        status:
          (rawEvent.status as "draft" | "published" | "archived") || "draft",
        date: (rawEvent.date as string) || "",
        startTime: (rawEvent.start_time as string) || "",
        location: (rawEvent.location as string) || "",
        address: (rawEvent.address as string) || "",
        mapsUrl: (rawEvent.maps_url as string) || "",
        wazeUrl: (rawEvent.waze_url as string) || "",
        dressCode: (rawEvent.dress_code as string) || "",
        giftsText: (rawEvent.gifts_text as string) || "",
        memorooUrl: (rawEvent.memoroo_url as string) || "",
        memorooQrUrl: (rawEvent.memoroo_qr_url as string) || "",
      },
    };
  } catch (_e) {
    return getLocalDemoGroup(token, eventSlug);
  }
}
