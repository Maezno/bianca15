'use server';

import { getAdminEventById } from './events';
import { getTemplate } from '@/templates/registry';
import type { EventRow } from '@/types/database';
import type { TemplateTheme, ColorPreset } from '@/templates/types';
import type { ScheduleItem, EventDesignConfig, EventSectionConfig } from '@/types/event';

/**
 * Datos serializables del template que necesita el editor.
 * NO incluye EventPage/InvitationPage (funciones React) para evitar el
 * error "Functions cannot be passed directly to Client Components".
 * El cliente los resuelve localmente con getTemplate(templateId).
 */
export interface EditorTemplateData {
  supportedSections: string[];
  theme: TemplateTheme;
  colorPresets: ColorPreset[];
}

export interface EditorInitialData {
  event: EventRow;
  templateData: EditorTemplateData;
  schedule: ScheduleItem[];
  designConfig: EventDesignConfig;
  sectionConfig: EventSectionConfig;
}

export async function getEditorData(eventId: string): Promise<EditorInitialData | null> {
  const { event } = await getAdminEventById(eventId);
  if (!event) return null;

  const template = getTemplate(event.template_id);

  // Normalizar schedule
  let schedule: ScheduleItem[] = [];
  if (Array.isArray(event.schedule)) {
    schedule = event.schedule as unknown as ScheduleItem[];
  }

  // Normalizar design_config
  const designConfig: EventDesignConfig = (event.design_config as unknown as EventDesignConfig) || {};

  // Normalizar section_config (usar las secciones de la plantilla como base si no hay config)
  const rawSectionConfig = (event.section_config as unknown as EventSectionConfig) || {};
  const templateSections = template.supportedSections || template.sections;

  const order = rawSectionConfig.order && rawSectionConfig.order.length > 0
    ? rawSectionConfig.order
    : [...templateSections];

  const enabled: Record<string, boolean> = {};
  templateSections.forEach((sec) => {
    enabled[sec] = rawSectionConfig.enabled?.[sec] !== false;
  });

  return {
    event,
    templateData: {
      supportedSections: templateSections,
      theme: template.theme,
      colorPresets: template.colorPresets || [],
    },
    schedule,
    designConfig,
    sectionConfig: {
      order,
      enabled,
    },
  };
}
