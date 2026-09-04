/**
 * Tipos de eventos para la plataforma multi-evento.
 * Cada evento es independiente y almacena su propia configuración,
 * plantilla y datos públicos.
 */

export type EventType = "15_years" | "wedding" | "birthday" | "corporate" | "other";
export type EventStatus = "draft" | "published" | "archived";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface EventLayoutConfig {
  mode?: "fluid" | "fixed";
  sectionHeight?: number;
  sectionHeights?: Record<string, number>;
  sectionGap?: number;
  continuousBackgroundUrl?: string;
  contentAlignment?: "center" | "top";
  transparentSections?: boolean;
}

export interface EventDesignConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
    textMuted?: string;
    accent?: string;
    border?: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
  };
  layout?: EventLayoutConfig;
}

export interface PhotosSectionConfig {
  enabled?: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  albumUrl?: string;
  qrEnabled?: boolean;
}

export interface EventSectionConfig {
  order?: string[];
  enabled?: Record<string, boolean>;
  photos?: PhotosSectionConfig;
}

export interface Event {
  id: string;
  slug: string;
  name: string;
  title: string;
  subtitle?: string;
  welcome_text?: string;
  type: EventType | string;
  template_id: string;
  template_version?: string;
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
  cover_image?: string;
  schedule?: ScheduleItem[];
  design_config?: EventDesignConfig;
  section_config?: EventSectionConfig;
  whatsapp_template?: string;
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
  subtitle?: string;
  welcomeText?: string;
  type: string;
  templateId: string;
  templateVersion?: string;
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
  coverImage?: string;
  schedule?: ScheduleItem[];
  designConfig?: EventDesignConfig;
  sectionConfig?: EventSectionConfig;
  whatsappTemplate?: string;
}
