/**
 * Tipos de base de datos para Supabase.
 * Representan las tablas de PostgreSQL definidas en supabase/migrations/
 *
 * Para generar tipos automáticamente desde Supabase en hitos futuros:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ConfirmationStatus = "pending" | "confirmed" | "declined";

// ─── Tablas ───────────────────────────────────────────────────────────────────

/**
 * Representa a una persona, familia o grupo de invitados.
 * Tabla: guest_groups
 */
export interface GuestGroup {
  id: string; // UUID
  name: string;
  token: string; // Identificador único aleatorio, sin información personal
  max_guests: number;
  phone: string | null;
  notes: string | null;
  created_at: string; // ISO 8601 con timezone
  updated_at: string; // ISO 8601 con timezone
}

/**
 * Representa a una persona individual dentro de un grupo de invitados.
 * Tabla: guests
 */
export interface Guest {
  id: string; // UUID
  group_id: string; // FK → guest_groups.id
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Representa la confirmación de asistencia de un grupo.
 * Tabla: confirmations
 */
export interface Confirmation {
  id: string; // UUID
  group_id: string; // FK → guest_groups.id (UNIQUE: un grupo, una confirmación)
  status: ConfirmationStatus;
  guests_count: number | null;
  comment: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Representa a una persona individual que efectivamente asistirá.
 * Tabla: attendees
 */
export interface Attendee {
  id: string; // UUID
  confirmation_id: string; // FK → confirmations.id
  name: string;
  dietary_restriction: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Tipos compuestos ─────────────────────────────────────────────────────────

/** GuestGroup con sus Guests incluidos (para consultas JOIN) */
export interface GuestGroupWithGuests extends GuestGroup {
  guests: Guest[];
}

/** Confirmation con sus Attendees incluidos (para consultas JOIN) */
export interface ConfirmationWithAttendees extends Confirmation {
  attendees: Attendee[];
}

// ─── Tipos de base para Supabase generics ────────────────────────────────────

/**
 * Definición de tipos de la base de datos para el cliente de Supabase.
 * Se usa como parámetro genérico: createClient<Database>()
 */
export interface Database {
  public: {
    Tables: {
      guest_groups: {
        Row: GuestGroup;
        Insert: Omit<GuestGroup, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<GuestGroup, "id" | "created_at" | "updated_at">>;
      };
      guests: {
        Row: Guest;
        Insert: Omit<Guest, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<Guest, "id" | "created_at" | "updated_at">>;
      };
      confirmations: {
        Row: Confirmation;
        Insert: Omit<Confirmation, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<
          Omit<Confirmation, "id" | "created_at" | "updated_at">
        >;
      };
      attendees: {
        Row: Attendee;
        Insert: Omit<Attendee, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<Attendee, "id" | "created_at" | "updated_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      confirmation_status: ConfirmationStatus;
    };
  };
}
