import type { TemplateTheme } from './types';
import type { EventDesignConfig, EventSectionConfig } from '@/types/event';

/**
 * Resuelve el tema final de una plantilla aplicando cualquier override de diseño del evento.
 */
export function resolveTheme(baseTheme: TemplateTheme, designConfig?: EventDesignConfig): TemplateTheme {
  if (!designConfig) return baseTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...(designConfig.colors || {}),
    },
    typography: {
      ...baseTheme.typography,
      headingFont: designConfig.typography?.headingFont || baseTheme.typography.headingFont,
      bodyFont: designConfig.typography?.bodyFont || baseTheme.typography.bodyFont,
    },
  };
}

/**
 * Retorna las secciones habilitadas y ordenadas según la configuración del evento.
 */
export function getActiveSections(
  defaultSections: string[],
  sectionConfig?: EventSectionConfig
): string[] {
  if (!sectionConfig) return defaultSections;

  const order = sectionConfig.order && sectionConfig.order.length > 0
    ? sectionConfig.order
    : defaultSections;

  return order.filter((sectionKey) => {
    // Si no está especificado explícitamente como false, se mantiene visible
    return sectionConfig.enabled?.[sectionKey] !== false;
  });
}
