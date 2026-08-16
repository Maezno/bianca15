import type { PublicEvent } from "@/types/event";

/**
 * Tipos específicos del módulo de invitados.
 * Adaptados para la plataforma multi-evento.
 */

// ─── Entrada para crear un grupo ─────────────────────────────────────────────

export interface CreateGroupInput {
  eventId: string; // FK al evento obligatorio
  name: string;
  phone?: string;
  maxGuests: number;
  notes?: string;
}

// ─── Entrada para crear un invitado ─────────────────────────────────────────

export interface CreateGuestInput {
  groupId: string;
  name: string;
}

// ─── Resultado de la consulta pública por token ───────────────────────────────

/**
 * Datos del grupo e información pública del evento para renderizar la invitación.
 * No incluye campos sensibles (phone, notes, IDs internos).
 */
export interface PublicGuestGroup {
  id: string;
  eventId: string;
  name: string;
  token: string;
  maxGuests: number;
  guests: PublicGuest[];
  confirmation: PublicConfirmation | null;
  event: PublicEvent;
}

export interface PublicGuest {
  id: string;
  name: string;
}

export interface PublicConfirmation {
  status: "pending" | "confirmed" | "declined";
  guestsCount: number | null;
}

// ─── Resultado de creación ───────────────────────────────────────────────────

export interface CreateGroupResult {
  id: string;
  eventId: string;
  name: string;
  token: string;
  maxGuests: number;
  createdAt: string;
}

export interface CreateGuestResult {
  id: string;
  groupId: string;
  name: string;
  createdAt: string;
}
