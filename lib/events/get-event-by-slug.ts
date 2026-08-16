import { createClient } from "@/lib/supabase/server";
import type { PublicEvent } from "@/types/event";

// Datos locales de demostración para desarrollo y testing sin conexión a Supabase
const DEMO_EVENTS: Record<string, PublicEvent> = {
  "bianca-15": {
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
  "juan-y-maria": {
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
};

/**
 * Obtiene la información pública de un evento a partir de su slug.
 *
 * @param slug - Identificador URL-safe del evento
 */
export async function getEventBySlug(
  slug: string
): Promise<PublicEvent | null> {
  const cleanSlug = slug?.trim().toLowerCase();
  if (!cleanSlug) return null;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .rpc("get_event_by_slug", { p_slug: cleanSlug })
      .maybeSingle();

    if (error) {
      // Fallback a datos de prueba locales si Supabase no está conectado
      return DEMO_EVENTS[cleanSlug] || null;
    }

    if (!data) return DEMO_EVENTS[cleanSlug] || null;

    const raw = data as Record<string, unknown>;

    return {
      id: raw.id as string,
      slug: raw.slug as string,
      name: raw.name as string,
      title: raw.title as string,
      type: (raw.type as string) || "other",
      templateId: (raw.template_id as string) || "default",
      status: (raw.status as "draft" | "published" | "archived") || "draft",
      date: (raw.date as string) || "",
      startTime: (raw.start_time as string) || "",
      location: (raw.location as string) || "",
      address: (raw.address as string) || "",
      mapsUrl: (raw.maps_url as string) || "",
      wazeUrl: (raw.waze_url as string) || "",
      dressCode: (raw.dress_code as string) || "",
      giftsText: (raw.gifts_text as string) || "",
      memorooUrl: (raw.memoroo_url as string) || "",
      memorooQrUrl: (raw.memoroo_qr_url as string) || "",
    };
  } catch (_e) {
    return DEMO_EVENTS[cleanSlug] || null;
  }
}
