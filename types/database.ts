/**
 * Tipos oficiales de base de datos para Supabase.
 * Formato compatible con GenericSchema de @supabase/supabase-js.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];
};

export type GenericFunction = {
  Args: Record<string, unknown> | never;
  Returns: unknown;
  SetofOptions?: {
    isSetofReturn?: boolean;
    isOneToOne?: boolean;
    isNotNullable?: boolean;
    to: string;
    from: string;
  };
};

export type Database = {
  public: {
    Tables: Record<string, GenericTable> & {
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          title: string;
          type: string;
          template_id: string;
          status: string;
          date: string | null;
          start_time: string | null;
          location: string | null;
          address: string | null;
          maps_url: string | null;
          waze_url: string | null;
          dress_code: string | null;
          gifts_text: string | null;
          memoroo_url: string | null;
          memoroo_qr_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          title: string;
          type?: string;
          template_id?: string;
          status?: string;
          date?: string | null;
          start_time?: string | null;
          location?: string | null;
          address?: string | null;
          maps_url?: string | null;
          waze_url?: string | null;
          dress_code?: string | null;
          gifts_text?: string | null;
          memoroo_url?: string | null;
          memoroo_qr_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          title?: string;
          type?: string;
          template_id?: string;
          status?: string;
          date?: string | null;
          start_time?: string | null;
          location?: string | null;
          address?: string | null;
          maps_url?: string | null;
          waze_url?: string | null;
          dress_code?: string | null;
          gifts_text?: string | null;
          memoroo_url?: string | null;
          memoroo_qr_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guest_groups: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          token: string;
          max_guests: number;
          phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          token: string;
          max_guests?: number;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          token?: string;
          max_guests?: number;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guest_groups_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      guests: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guests_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "guest_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      confirmations: {
        Row: {
          id: string;
          group_id: string;
          status: string;
          guests_count: number | null;
          comment: string | null;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          status?: string;
          guests_count?: number | null;
          comment?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          status?: string;
          guests_count?: number | null;
          comment?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "confirmations_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: true;
            referencedRelation: "guest_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      attendees: {
        Row: {
          id: string;
          confirmation_id: string;
          name: string;
          dietary_restriction: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          confirmation_id: string;
          name: string;
          dietary_restriction?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          confirmation_id?: string;
          name?: string;
          dietary_restriction?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendees_confirmation_id_fkey";
            columns: ["confirmation_id"];
            isOneToOne: false;
            referencedRelation: "confirmations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, { Row: Record<string, unknown>; Relationships: GenericRelationship[] }>;
    Functions: Record<string, GenericFunction> & {
      get_event_by_slug: {
        Args: {
          p_slug: string;
        };
        Returns: Json;
      };
      get_invitation_by_token: {
        Args: {
          p_token: string;
          p_slug?: string;
        };
        Returns: Json;
      };
      get_confirmation_by_token: {
        Args: {
          p_token: string;
        };
        Returns: Json;
      };
      save_confirmation: {
        Args: {
          p_token: string;
          p_status: string;
          p_guests_count: number;
          p_comment: string;
          p_attendees: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
};

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type GuestGroup = Database["public"]["Tables"]["guest_groups"]["Row"];
export type Guest = Database["public"]["Tables"]["guests"]["Row"];
export type Confirmation = Database["public"]["Tables"]["confirmations"]["Row"];
export type Attendee = Database["public"]["Tables"]["attendees"]["Row"];
export type ConfirmationStatus = "pending" | "confirmed" | "declined";
