import type { DietaryOption } from './types';

export const MAX_NAME_LENGTH = 100;
export const MAX_COMMENT_LENGTH = 500;
export const MIN_GUESTS = 1;

export const DIETARY_OPTIONS: { value: DietaryOption; label: string }[] = [
  { value: 'none',       label: 'Ninguna' },
  { value: 'vegetarian', label: 'Vegetariano/a' },
  { value: 'vegan',      label: 'Vegano/a' },
  { value: 'celiac',     label: 'Celíaco/a' },
  { value: 'other',      label: 'Otra' },
];

export const VALID_DIETARY_VALUES: string[] = DIETARY_OPTIONS.map((o) => o.value);

export interface AttendeeValidationInput {
  name: string;
  dietaryRestriction: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates a full confirmation payload on the server before writing to DB.
 * Returns an array of errors (empty = valid).
 */
export function validateConfirmationPayload(params: {
  status: string;
  guestsCount: number;
  maxGuests: number;
  attendees: AttendeeValidationInput[];
  comment: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!['confirmed', 'declined'].includes(params.status)) {
    errors.push({ field: 'status', message: 'Estado inválido.' });
    return errors; // Can't validate further
  }

  if (params.status === 'confirmed') {
    if (
      !Number.isInteger(params.guestsCount) ||
      params.guestsCount < MIN_GUESTS ||
      params.guestsCount > params.maxGuests
    ) {
      errors.push({
        field: 'guestsCount',
        message: `La cantidad debe estar entre 1 y ${params.maxGuests}.`,
      });
    }

    if (params.attendees.length !== params.guestsCount) {
      errors.push({
        field: 'attendees',
        message: 'La cantidad de asistentes no coincide con la seleccionada.',
      });
    }

    params.attendees.forEach((attendee, i) => {
      const name = attendee.name.trim();
      if (!name) {
        errors.push({
          field: `attendees.${i}.name`,
          message: `El nombre de la persona ${i + 1} es obligatorio.`,
        });
      } else if (name.length > MAX_NAME_LENGTH) {
        errors.push({
          field: `attendees.${i}.name`,
          message: `El nombre de la persona ${i + 1} no puede superar los ${MAX_NAME_LENGTH} caracteres.`,
        });
      }

      // For 'other', the field stores the custom text (any string is valid).
      // For predefined values, validate against the list.
      const dietary = attendee.dietaryRestriction;
      const isKnownOption = VALID_DIETARY_VALUES.includes(dietary);
      if (!isKnownOption && dietary.length > MAX_NAME_LENGTH) {
        errors.push({
          field: `attendees.${i}.dietary`,
          message: `La restricción alimentaria de la persona ${i + 1} es demasiado larga.`,
        });
      }
    });
  } else {
    // declined — no attendees expected
    if (params.attendees.length !== 0) {
      errors.push({
        field: 'attendees',
        message: 'No se esperan asistentes al declinar.',
      });
    }
  }

  if (params.comment && params.comment.length > MAX_COMMENT_LENGTH) {
    errors.push({
      field: 'comment',
      message: `El mensaje no puede superar los ${MAX_COMMENT_LENGTH} caracteres.`,
    });
  }

  return errors;
}
