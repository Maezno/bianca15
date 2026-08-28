import type { InvitationTemplate } from './types';
import { wonderlandTemplate } from './wonderland';
import { elegantTemplate } from './elegant';
import { defaultTemplate } from './default';

const TEMPLATE_REGISTRY: Record<string, InvitationTemplate> = {
  wonderland: wonderlandTemplate,
  elegant: elegantTemplate,
  default: defaultTemplate,
};

/**
 * Obtiene la plantilla registrada según su ID.
 * Si no existe o es null/undefined, retorna la plantilla por defecto (fallback seguro).
 */
export function getTemplate(templateId?: string | null): InvitationTemplate {
  if (!templateId) return defaultTemplate;
  const cleanId = templateId.trim().toLowerCase();
  return TEMPLATE_REGISTRY[cleanId] || defaultTemplate;
}

/**
 * Obtiene la plantilla registrada únicamente si existe en el registro.
 * Retorna null si el template_id no existe.
 */
export function getRegisteredTemplate(templateId?: string | null): InvitationTemplate | null {
  if (!templateId) return null;
  const cleanId = templateId.trim().toLowerCase();
  return TEMPLATE_REGISTRY[cleanId] || null;
}

/**
 * Verifica si un template_id está registrado en la plataforma.
 */
export function isValidTemplateId(templateId: string): boolean {
  if (!templateId) return false;
  return templateId.trim().toLowerCase() in TEMPLATE_REGISTRY;
}

/**
 * Retorna la lista de todas las plantillas registradas (para selectores administrativos).
 */
export function getAllTemplates(): InvitationTemplate[] {
  return [wonderlandTemplate, elegantTemplate];
}

export * from './types';
