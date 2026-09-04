-- =====================================================================
-- MIGRACIÓN 0010: Mejoras de invitados, RSVP y plantillas de WhatsApp (Hito 8)
-- =====================================================================

-- 1. Agregar email y mensaje personalizado a guest_groups
ALTER TABLE guest_groups
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS personal_message TEXT;

COMMENT ON COLUMN guest_groups.email IS 'Email de contacto del invitado o familia';
COMMENT ON COLUMN guest_groups.personal_message IS 'Mensaje personalizado opcional redactado por los anfitriones';

-- 2. Agregar plantilla base de WhatsApp a events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS whatsapp_template TEXT DEFAULT '¡Hola {{guest_name}}! Te compartimos la invitación para {{event_name}}: {{invitation_url}}';

COMMENT ON COLUMN events.whatsapp_template IS 'Plantilla configurable de mensaje para WhatsApp con variables dinámicas';

-- 3. Índice en guest_groups(event_id, token) para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_guest_groups_event_token
  ON guest_groups(event_id, token);

-- 4. Actualizar función RPC: get_invitation_by_token para incluir personal_message
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
  v_group RECORD;
  v_event RECORD;
BEGIN
  -- 1. Buscar el grupo por token
  SELECT g.id, g.event_id, g.name, g.token, g.max_guests, g.phone, g.email, g.personal_message
  INTO   v_group
  FROM   guest_groups g
  WHERE  g.token = p_token
  LIMIT  1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 2. Buscar el evento asociado
  SELECT e.id, e.slug, e.name, e.title, e.subtitle, e.welcome_text, e.type, e.template_id, e.template_version, e.status,
         e.date, e.start_time, e.location, e.address, e.maps_url, e.waze_url,
         e.dress_code, e.gifts_text, e.memoroo_url, e.memoroo_qr_url,
         e.schedule, e.design_config, e.section_config, e.whatsapp_template
  INTO   v_event
  FROM   events e
  WHERE  e.id = v_group.event_id
  LIMIT  1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 3. Si se especificó slug, validar aislamiento
  IF p_slug IS NOT NULL AND v_event.slug != p_slug THEN
    RETURN NULL;
  END IF;

  -- 4. Retornar payload seguro
  RETURN jsonb_build_object(
    'id',               v_group.id,
    'event_id',         v_group.event_id,
    'name',             v_group.name,
    'token',            v_group.token,
    'max_guests',       v_group.max_guests,
    'email',            v_group.email,
    'personal_message', v_group.personal_message,
    'event', jsonb_build_object(
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
      'section_config',   COALESCE(v_event.section_config, '{}'::JSONB),
      'whatsapp_template', v_event.whatsapp_template
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT, TEXT) TO authenticated;
