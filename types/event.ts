/**
 * Tipos de eventos para la plataforma multi-evento.
 * Cada evento es independiente y almacena su propia configuración,
 * plantilla y datos públicos.
 */

export type EventType = "15_years" | "wedding" | "birthday" | "other";
export type EventStatus = "draft" | "published" | "archived";

export interface Event {
  id: string;
  slug: string;
  name: string;
  title: string;
  type: EventType | string;
  template_id: string;
  status: EventStatus;
  date: string;
  start_time: string;
  location: string;
  address: string;
  maps_url: string;
  waze_url: string;
  dress_code: string;
  gifts_text: string;
  memoroo_url: string;
  memoroo_qr_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Datos públicos del evento que se exponen al renderizar la invitación.
 */
export interface PublicEvent {
  id: string;
  slug: string;
  name: string;
  title: string;
  type: string;
  templateId: string;
  status: EventStatus;
  date: string;
  startTime: string;
  location: string;
  address: string;
  mapsUrl: string;
  wazeUrl: string;
  dressCode: string;
  giftsText: string;
  memorooUrl: string;
  memorooQrUrl: string;
}
