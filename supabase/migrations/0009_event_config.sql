-- ============================================================
-- MIGRACIÓN 0009: Configuración Avanzada y Personalización de Eventos (Hito 6)
-- ============================================================
-- Objetivo:
--   Permitir almacenar configuraciones de contenido extendido,
--   cronograma de actividades, overrides de diseño visual y visibilidad/orden de secciones.
-- ============================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS welcome_text TEXT,
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS design_config JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS section_config JSONB DEFAULT '{}'::JSONB;

COMMENT ON COLUMN events.subtitle IS 'Subtítulo del evento (ej: Te invito a celebrar conmigo)';
COMMENT ON COLUMN events.welcome_text IS 'Texto de bienvenida personalizado';
COMMENT ON COLUMN events.schedule IS 'Array de actividades del cronograma: [{ time, title, description, icon }]';
COMMENT ON COLUMN events.design_config IS 'Configuración de diseño/tema (colores, tipografía, estilo)';
COMMENT ON COLUMN events.section_config IS 'Configuración de secciones ({ order: string[], enabled: Record<string, boolean> })';

-- ─── Actualizar RPC: get_event_by_slug ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_event_by_slug(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
BEGIN
  SELECT id, slug, name, title, subtitle, welcome_text, type, template_id, template_version, status,
         date, start_time, location, address, maps_url, waze_url,
         dress_code, gifts_text, memoroo_url, memoroo_qr_url,
         schedule, design_config, section_config
  INTO   v_event
  FROM   events
  WHERE  slug = p_slug
  LIMIT  1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id',               v_event.id,
    'slug',             v_event.slug,
    'name',             v_event.name,
    'title',            v_event.title,
    'subtitle',         v_event.subtitle,
    'welcome_text',     v_event.welcome_text,
    'type',             v_event.type,
    'template_id',      v_event.template_id,
    'template_version', v_event.template_version,
    'status',           v_event.status,
    'date',             v_event.date,
    'start_time',       v_event.start_time,
    'location',         v_event.location,
    'address',          v_event.address,
    'maps_url',         v_event.maps_url,
    'waze_url',         v_event.waze_url,
    'dress_code',       v_event.dress_code,
    'gifts_text',       v_event.gifts_text,
    'memoroo_url',      v_event.memoroo_url,
    'memoroo_qr_url',   v_event.memoroo_qr_url,
    'schedule',         COALESCE(v_event.schedule, '[]'::JSONB),
    'design_config',    COALESCE(v_event.design_config, '{}'::JSONB),
    'section_config',   COALESCE(v_event.section_config, '{}'::JSONB)
  );
END;
$$;

-- ─── Actualizar RPC: get_invitation_by_token ──────────────────────────────────

CREATE OR REPLACE FUNCTION get_invitation_by_token(
  p_token TEXT,
  p_slug TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group     RECORD;
  v_event     RECORD;
  v_guests    JSONB;
  v_conf      JSONB;
  v_result    JSONB;
BEGIN
  IF p_slug IS NOT NULL THEN
    SELECT gg.id, gg.event_id, gg.name, gg.token, gg.max_guests
    INTO   v_group
    FROM   guest_groups gg
    JOIN   events e ON e.id = gg.event_id
    WHERE  gg.token = p_token
      AND  e.slug = p_slug
    LIMIT  1;
  ELSE
    SELECT gg.id, gg.event_id, gg.name, gg.token, gg.max_guests
    INTO   v_group
    FROM   guest_groups gg
    WHERE  gg.token = p_token
    LIMIT  1;
  END IF;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT id, slug, name, title, subtitle, welcome_text, type, template_id, template_version, status,
         date, start_time, location, address, maps_url, waze_url,
         dress_code, gifts_text, memoroo_url, memoroo_qr_url,
         schedule, design_config, section_config
  INTO   v_event
  FROM   events
  WHERE  id = v_group.event_id
  LIMIT  1;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',   g.id,
        'name', g.name
      )
      ORDER BY g.created_at ASC
    ),
    '[]'::JSONB
  )
  INTO v_guests
  FROM guests g
  WHERE g.group_id = v_group.id;

  SELECT jsonb_build_object(
    'status',       c.status,
    'guests_count', c.guests_count
  )
  INTO v_conf
  FROM confirmations c
  WHERE c.group_id = v_group.id
  LIMIT 1;

  v_result := jsonb_build_object(
    'id',           v_group.id,
    'event_id',     v_group.event_id,
    'name',         v_group.name,
    'token',        v_group.token,
    'max_guests',   v_group.max_guests,
    'guests',       v_guests,
    'confirmation', v_conf,
    'event',        jsonb_build_object(
      'id',               v_event.id,
      'slug',             v_event.slug,
      'name',             v_event.name,
      'title',            v_event.title,
      'subtitle',         v_event.subtitle,
      'welcome_text',     v_event.welcome_text,
      'type',             v_event.type,
      'template_id',      v_event.template_id,
      'template_version', v_event.template_version,
      'status',           v_event.status,
      'date',             v_event.date,
      'start_time',       v_event.start_time,
      'location',         v_event.location,
      'address',          v_event.address,
      'maps_url',         v_event.maps_url,
      'waze_url',         v_event.waze_url,
      'dress_code',       v_event.dress_code,
      'gifts_text',       v_event.gifts_text,
      'memoroo_url',      v_event.memoroo_url,
      'memoroo_qr_url',   v_event.memoroo_qr_url,
      'schedule',         COALESCE(v_event.schedule, '[]'::JSONB),
      'design_config',    COALESCE(v_event.design_config, '{}'::JSONB),
      'section_config',   COALESCE(v_event.section_config, '{}'::JSONB)
    )
  );

  RETURN v_result;
END;
$$;
