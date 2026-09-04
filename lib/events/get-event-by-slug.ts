import { createClient } from "@/lib/supabase/server";
import type { PublicEvent } from "@/types/event";
import { getDemoEventBySlug } from "./demo-store";

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

    if (error || !data) {
      // Fallback a demo store si Supabase no está conectado
      return getDemoEventBySlug(cleanSlug);
    }

    const raw = data as Record<string, unknown>;

    return {
      id: raw.id as string,
      slug: raw.slug as string,
      name: raw.name as string,
      title: raw.title as string,
      subtitle: (raw.subtitle as string) || undefined,
      welcomeText: (raw.welcome_text as string) || undefined,
      type: (raw.type as string) || "other",
      templateId: (raw.template_id as string) || "default",
      templateVersion: (raw.template_version as string) || "1.0.0",
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
      coverImage: (raw.cover_image as string) || undefined,
      schedule: Array.isArray(raw.schedule) ? (raw.schedule as import("@/types/event").ScheduleItem[]) : undefined,
      designConfig: (raw.design_config as import("@/types/event").EventDesignConfig) || undefined,
      sectionConfig: (raw.section_config as import("@/types/event").EventSectionConfig) || undefined,
    };
  } catch {
    return getDemoEventBySlug(cleanSlug);
  }
}
