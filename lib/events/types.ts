import type { PublicEvent } from "@/types/event";

export type { PublicEvent };

export interface CreateEventInput {
  slug: string;
  name: string;
  title: string;
  type?: string;
  templateId?: string;
  status?: "draft" | "published" | "archived";
  date?: string;
  startTime?: string;
  location?: string;
  address?: string;
  mapsUrl?: string;
  wazeUrl?: string;
  dressCode?: string;
  giftsText?: string;
  memorooUrl?: string;
  memorooQrUrl?: string;
}
