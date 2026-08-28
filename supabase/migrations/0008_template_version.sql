-- Migración 0008: Agregar columna template_version en la tabla events
-- Permite versionar la apariencia visual de las plantillas manteniendo compatibilidad hacia adelante.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS template_version TEXT DEFAULT '1.0.0';

COMMENT ON COLUMN events.template_version IS 'Versión de la plantilla asignada (ej: 1.0.0)';
