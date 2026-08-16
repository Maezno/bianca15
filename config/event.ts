import type { PublicEvent } from "@/types/event";

/**
 * Configuración de desarrollo / fallback para plantillas de eventos.
 *
 * En la plataforma multi-evento, cada evento obtiene su configuración
 * desde la base de datos (PostgreSQL / Supabase).
 *
 * Este archivo se conserva como plantilla de desarrollo y fallback local.
 */
export const defaultEventFallback: PublicEvent = {
  id: "00000000-0000-0000-0000-000000000000",
  slug: "demo-event",
  name: "Evento de Demostración",
  title: "Mi Evento Especial",
  type: "other",
  templateId: "wonderland",
  status: "draft",
  date: "",
  startTime: "",
  location: "",
  address: "",
  mapsUrl: "",
  wazeUrl: "",
  dressCode: "",
  giftsText: "",
  memorooUrl: "",
  memorooQrUrl: "",
};
