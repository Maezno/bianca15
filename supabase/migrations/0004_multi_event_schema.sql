-- ============================================================
-- MIGRACIÓN 0004: Esquema Multi-Evento / Multi-Tenant
-- ============================================================
-- Objetivo:
--   Convertir el proyecto en una plataforma reutilizable de invitaciones
--   digitales donde cada evento es independiente.
--
-- Entidades:
--   1. events         — Eventos de la plataforma
--   2. guest_groups   — Se asocia con events.id mediante event_id
-- ============================================================

-- ─── Tabla: events ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        NOT NULL,
  name            TEXT        NOT NULL, -- Nombre interno (ej: "Bianca - 15 años")
  title           TEXT        NOT NULL, -- Título público (ej: "Mis 15 años")
  type            TEXT        NOT NULL DEFAULT 'other', -- '15_years' | 'wedding' | 'birthday' | 'other'
  template_id     TEXT        NOT NULL DEFAULT 'wonderland',
  status          TEXT        NOT NULL DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
  date            TEXT,
  start_time      TEXT,
  location        TEXT,
  address         TEXT,
  maps_url        TEXT,
  waze_url        TEXT,
  dress_code      TEXT,
  gifts_text      TEXT,
  memoroo_url     TEXT,
  memoroo_qr_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT events_slug_unique UNIQUE (slug)
);

COMMENT ON TABLE  events                 IS 'Eventos independientes en la plataforma multi-tenant';
COMMENT ON COLUMN events.slug            IS 'Identificador único y URL-safe del evento (ej: bianca-15)';
COMMENT ON COLUMN events.template_id     IS 'Identificador de la plantilla visual (wonderland, elegant, etc.)';

-- ─── Alterar guest_groups: agregar event_id ──────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guest_groups' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE guest_groups ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ─── Índices ──────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug
  ON events(slug);

CREATE INDEX IF NOT EXISTS idx_events_status
  ON events(status);

CREATE INDEX IF NOT EXISTS idx_guest_groups_event_id
  ON guest_groups(event_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_groups_event_token
  ON guest_groups(event_id, token);

-- ─── Trigger: updated_at en events ───────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS en events ────────────────────────────────────────────────────────────

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_no_direct_anon_access"
  ON events
  FOR ALL
  TO anon
  USING (false);

-- ─── RPC: get_event_by_slug ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_event_by_slug(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
BEGIN
  SELECT id, slug, name, title, type, template_id, status,
         date, start_time, location, address, maps_url, waze_url,
         dress_code, gifts_text, memoroo_url, memoroo_qr_url
  INTO   v_event
  FROM   events
  WHERE  slug = p_slug
  LIMIT  1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id',             v_event.id,
    'slug',           v_event.slug,
    'name',           v_event.name,
    'title',          v_event.title,
    'type',           v_event.type,
    'template_id',    v_event.template_id,
    'status',         v_event.status,
    'date',           v_event.date,
    'start_time',     v_event.start_time,
    'location',       v_event.location,
    'address',        v_event.address,
    'maps_url',       v_event.maps_url,
    'waze_url',       v_event.waze_url,
    'dress_code',     v_event.dress_code,
    'gifts_text',     v_event.gifts_text,
    'memoroo_url',    v_event.memoroo_url,
    'memoroo_qr_url', v_event.memoroo_qr_url
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_event_by_slug(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_event_by_slug(TEXT) TO authenticated;

-- ─── RPC: get_invitation_by_token (Actualizada con aislamiento) ───────────────

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
  -- 1. Buscar grupo por token (y opcionalmente por slug del evento para validar aislamiento)
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

  -- 2. Buscar datos públicos del evento
  SELECT id, slug, name, title, type, template_id, status,
         date, start_time, location, address, maps_url, waze_url,
         dress_code, gifts_text, memoroo_url, memoroo_qr_url
  INTO   v_event
  FROM   events
  WHERE  id = v_group.event_id
  LIMIT  1;

  -- 3. Obtener los invitados del grupo
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

  -- 4. Obtener confirmación vigente
  SELECT jsonb_build_object(
    'status',       c.status,
    'guests_count', c.guests_count
  )
  INTO v_conf
  FROM confirmations c
  WHERE c.group_id = v_group.id
  LIMIT 1;

  -- 5. Construir resultado unificado
  v_result := jsonb_build_object(
    'id',           v_group.id,
    'event_id',     v_group.event_id,
    'name',         v_group.name,
    'token',        v_group.token,
    'max_guests',   v_group.max_guests,
    'guests',       v_guests,
    'confirmation', v_conf,
    'event',        jsonb_build_object(
      'id',             v_event.id,
      'slug',           v_event.slug,
      'name',           v_event.name,
      'title',          v_event.title,
      'type',           v_event.type,
      'template_id',    v_event.template_id,
      'status',         v_event.status,
      'date',           v_event.date,
      'start_time',     v_event.start_time,
      'location',       v_event.location,
      'address',        v_event.address,
      'maps_url',       v_event.maps_url,
      'waze_url',       v_event.waze_url,
      'dress_code',     v_event.dress_code,
      'gifts_text',     v_event.gifts_text,
      'memoroo_url',    v_event.memoroo_url,
      'memoroo_qr_url', v_event.memoroo_qr_url
    )
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT, TEXT) TO authenticated;

-- ─── FIN DE MIGRACIÓN 0004 ───────────────────────────────────────────────────
