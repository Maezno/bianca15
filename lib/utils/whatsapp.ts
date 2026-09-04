/**
 * Utilidades para generación de enlaces y mensajes dinámicos de WhatsApp (Puntos 34 y 35 del Hito 8).
 */

export interface WhatsAppTemplateVariables {
  guestName: string;
  groupName: string;
  allowedGuests: number | string;
  invitationUrl: string;
  eventName?: string;
  eventTitle?: string;
}

const DEFAULT_WHATSAPP_TEMPLATE =
  '¡Hola {{guest_name}}! Te compartimos la invitación a nuestro evento: {{invitation_url}}';

/**
 * Reemplaza variables dinámicas en la plantilla de WhatsApp.
 */
export function formatWhatsAppMessage(
  template: string | null | undefined,
  variables: WhatsAppTemplateVariables
): string {
  const base = template?.trim() || DEFAULT_WHATSAPP_TEMPLATE;

  return base
    .replace(/\{\{\s*guest_name\s*\}\}/gi, variables.guestName)
    .replace(/\{\{\s*group_name\s*\}\}/gi, variables.groupName)
    .replace(/\{\{\s*allowed_guests\s*\}\}/gi, String(variables.allowedGuests))
    .replace(/\{\{\s*invitation_url\s*\}\}/gi, variables.invitationUrl)
    .replace(/\{\{\s*event_name\s*\}\}/gi, variables.eventName || '')
    .replace(/\{\{\s*event_title\s*\}\}/gi, variables.eventTitle || '');
}

/**
 * Genera el enlace directo a WhatsApp (web o app móvil).
 * Si el teléfono contiene caracteres como +, -, o espacios, los limpia.
 */
export function buildWhatsAppLink(
  phone: string | null | undefined,
  message: string
): string {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  // Si no hay teléfono especificado, enlace genérico para seleccionar contacto
  return `https://wa.me/?text=${encodedText}`;
}
