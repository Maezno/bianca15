export type ConfirmationStatus = 'pending' | 'confirmed' | 'declined';

export type DietaryOption = 'none' | 'vegetarian' | 'vegan' | 'celiac' | 'other';

export interface AttendeeInput {
  name: string;
  /** For 'other': store the custom text. Otherwise store the DietaryOption value. */
  dietaryRestriction: string;
}

export interface SaveConfirmationInput {
  token: string;
  status: 'confirmed' | 'declined';
  guestsCount: number;
  attendees: AttendeeInput[];
  comment: string;
}

export interface SaveConfirmationResult {
  success: boolean;
  error?: string;
}

export interface ExistingAttendee {
  name: string;
  dietaryRestriction: string | null;
}

export interface ExistingConfirmation {
  status: ConfirmationStatus;
  guestsCount: number | null;
  comment: string | null;
  confirmedAt: string | null;
  attendees: ExistingAttendee[];
}
