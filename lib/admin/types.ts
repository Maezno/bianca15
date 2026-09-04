import type { GuestGroup, Guest, Confirmation, Attendee, AdminRole } from '@/types/database';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AdminEventSummary {
  id: string;
  slug: string;
  name: string;
  title: string;
  type: string;
  templateId?: string;
  templateVersion?: string;
  status: 'draft' | 'published' | 'archived';
  date: string | null;
  startTime: string | null;
  location: string | null;
  address: string | null;
  totalGroups: number;
  confirmedGroups: number;
  pendingGroups: number;
  declinedGroups: number;
  totalMaxGuests: number;
  confirmedPersons: number;
  remainingCapacity: number;
}

export interface DietarySummaryItem {
  key: string;
  label: string;
  count: number;
}

export interface DietaryDetailItem {
  groupName: string;
  attendeeName: string;
  restriction: string;
}

export interface AdminEventStats {
  groups: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  persons: {
    maxCapacity: number;
    confirmedPersons: number;
    remainingCapacity: number;
  };
  dietary: {
    summary: DietarySummaryItem[];
    details: DietaryDetailItem[];
  };
}

export interface AdminGuestGroupItem extends GuestGroup {
  guests: Guest[];
  confirmation: Confirmation | null;
  attendees: Attendee[];
  invitationUrl: string;
}

export interface CreateEventInput {
  name: string;
  title: string;
  slug: string;
  subtitle?: string;
  welcomeText?: string;
  type: string;
  templateId?: string;
  templateVersion?: string;
  status?: 'draft' | 'published' | 'archived';
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
  coverImage?: string;
  schedule?: import('@/types/event').ScheduleItem[];
  designConfig?: import('@/types/event').EventDesignConfig;
  sectionConfig?: import('@/types/event').EventSectionConfig;
  whatsappTemplate?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export interface AdminEventMedia {
  id: string;
  eventId: string;
  storagePath: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  isCover?: boolean;
  isUsed?: boolean;
  usedIn?: string[];
}

export interface CreateAdminGroupInput {
  eventId: string;
  name: string;
  maxGuests: number;
  phone?: string;
  email?: string;
  notes?: string;
  personalMessage?: string;
  initialGuests?: string[];
}

export interface UpdateAdminGroupInput {
  id: string;
  eventId: string;
  name: string;
  maxGuests: number;
  phone?: string;
  email?: string;
  notes?: string;
  personalMessage?: string;
}

export interface CsvParsedRow {
  grupo: string;
  cupo: string | number;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
}

export interface CsvValidatedRow {
  rowIndex: number;
  groupName: string;
  maxGuests: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
}

export interface CsvValidationSummary {
  totalRows: number;
  validRowsCount: number;
  warningRowsCount: number;
  errorRowsCount: number;
  distinctGroupsCount: number;
  rows: CsvValidatedRow[];
}
