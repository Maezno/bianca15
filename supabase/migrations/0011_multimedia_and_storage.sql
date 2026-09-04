-- ============================================================
-- MIGRACIÓN 0011: Multimedia, Supabase Storage y Álbum de Fotos (Hito 9)
-- ============================================================
-- Objetivo:
--   1. Agregar soporte para imagen de portada (cover_image) en events.
--   2. Crear tabla event_media para gestión de recursos multimedia por evento.
--   3. Crear tabla event_gallery para preparar futura galería interna propia.
--   4. Crear bucket 'event-assets' en Supabase Storage con aislamiento por evento.
--   5. Configurar políticas RLS para lectura pública y gestión administrativa.
--   6. Actualizar funciones RPC para retornar cover_image.
-- ============================================================

-- ─── 1. Columna cover_image en events ──────────────────────────────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS cover_image TEXT;

COMMENT ON COLUMN events.cover_image IS 'URL de la imagen principal / portada del evento (usada en Hero y Open Graph)';

-- ─── 2. Tabla: event_media ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_media (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,
  public_url   TEXT        NOT NULL,
  file_name    TEXT        NOT NULL,
  mime_type    TEXT        NOT NULL,
  file_size    INTEGER     NOT NULL,
  width        INTEGER,
  height       INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  event_media              IS 'Biblioteca multimedia de archivos subidos para cada evento';
COMMENT ON COLUMN event_media.storage_path IS 'Ruta relativa dentro del bucket event-assets (ej: event-id/uuid.webp)';
COMMENT ON COLUMN event_media.public_url   IS 'URL pública accesible del recurso en Supabase Storage';
COMMENT ON COLUMN event_media.file_size    IS 'Tamaño del archivo en bytes';

CREATE INDEX IF NOT EXISTS idx_event_media_event_id
  ON event_media(event_id);

CREATE INDEX IF NOT EXISTS idx_event_media_created_at
  ON event_media(created_at DESC);

-- ─── 3. Tabla: event_gallery (Arquitectura preparada para Hito futuro) ───────

CREATE TABLE IF NOT EXISTS event_gallery (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  media_id   UUID        REFERENCES event_media(id) ON DELETE SET NULL,
  image_url  TEXT        NOT NULL,
  caption    TEXT,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  event_gallery            IS 'Galería de fotos del evento (estructura preparada)';
COMMENT ON COLUMN event_gallery.sort_order IS 'Orden de aparición dentro de la galería';

CREATE INDEX IF NOT EXISTS idx_event_gallery_event_id
  ON event_gallery(event_id);

CREATE INDEX IF NOT EXISTS idx_event_gallery_sort_order
  ON event_gallery(event_id, sort_order ASC);

-- ─── 4. Bucket de Supabase Storage ───────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-assets', 'event-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ─── 5. Políticas RLS ────────────────────────────────────────────────────────

ALTER TABLE event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;

-- Lectura pública para media de eventos publicados o mediante frontend
CREATE POLICY "event_media_public_read"
  ON event_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_media.event_id
        AND e.status IN ('published', 'draft')
    )
  );

-- Gestión para usuarios autenticados / administradores
CREATE POLICY "event_media_admin_all"
  ON event_media
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Galería lectura pública
CREATE POLICY "event_gallery_public_read"
  ON event_gallery
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_gallery.event_id
        AND e.status IN ('published', 'draft')
    )
  );

-- Galería gestión administrativa
CREATE POLICY "event_gallery_admin_all"
  ON event_gallery
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para storage.objects en el bucket event-assets
CREATE POLICY "event_assets_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-assets');

CREATE POLICY "event_assets_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-assets');

CREATE POLICY "event_assets_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-assets');

CREATE POLICY "event_assets_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-assets');

-- ─── 6. Actualizar RPC: get_event_by_slug ─────────────────────────────────────

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
         dress_code, gifts_text, memoroo_url, memoroo_qr_url, cover_image,
         schedule, design_config, section_config, whatsapp_template
  INTO   v_event
  FROM   events
  WHERE  slug = p_slug
  LIMIT  1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id',                v_event.id,
    'slug',              v_event.slug,
    'name',              v_event.name,
    'title',             v_event.title,
    'subtitle',          v_event.subtitle,
    'welcome_text',      v_event.welcome_text,
    'type',              v_event.type,
    'template_id',       v_event.template_id,
    'template_version',  v_event.template_version,
    'status',            v_event.status,
    'date',              v_event.date,
    'start_time',        v_event.start_time,
    'location',          v_event.location,
    'address',           v_event.address,
    'maps_url',          v_event.maps_url,
    'waze_url',          v_event.waze_url,
    'dress_code',        v_event.dress_code,
    'gifts_text',        v_event.gifts_text,
    'memoroo_url',       v_event.memoroo_url,
    'memoroo_qr_url',    v_event.memoroo_qr_url,
    'cover_image',       v_event.cover_image,
    'schedule',          COALESCE(v_event.schedule, '[]'::JSONB),
    'design_config',     COALESCE(v_event.design_config, '{}'::JSONB),
    'section_config',    COALESCE(v_event.section_config, '{}'::JSONB),
    'whatsapp_template', v_event.whatsapp_template
  );
END;
$$;

-- ─── 7. Actualizar RPC: get_invitation_by_token ───────────────────────────────

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
    SELECT gg.id, gg.event_id, gg.name, gg.token, gg.max_guests,
           gg.phone, gg.notes, gg.whatsapp_status
    INTO   v_group
    FROM   guest_groups gg
    JOIN   events e ON e.id = gg.event_id
    WHERE  gg.token = p_token
      AND  e.slug = p_slug
    LIMIT  1;
  ELSE
    SELECT gg.id, gg.event_id, gg.name, gg.token, gg.max_guests,
           gg.phone, gg.notes, gg.whatsapp_status
    INTO   v_group
    FROM   guest_groups gg
    WHERE  gg.token = p_token
    LIMIT  1;
  END IF;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT e.id, e.slug, e.name, e.title, e.subtitle, e.welcome_text,
         e.type, e.template_id, e.template_version, e.status,
         e.date, e.start_time, e.location, e.address, e.maps_url, e.waze_url,
         e.dress_code, e.gifts_text, e.memoroo_url, e.memoroo_qr_url, e.cover_image,
         e.schedule, e.design_config, e.section_config, e.whatsapp_template
  INTO   v_event
  FROM   events e
  WHERE  e.id = v_group.event_id
  LIMIT  1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id',         g.id,
      'first_name', g.first_name,
      'last_name',  g.last_name,
      'is_child',   g.is_child,
      'sort_order', g.sort_order
    ) ORDER BY g.sort_order ASC, g.first_name ASC
  ), '[]'::JSONB)
  INTO   v_guests
  FROM   guests g
  WHERE  g.group_id = v_group.id;

  SELECT jsonb_build_object(
    'id',               c.id,
    'confirmed',        c.confirmed,
    'confirmed_at',     c.confirmed_at,
    'declined_reason',  c.declined_reason,
    'notes',            c.notes,
    'attendees',        COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id',                  a.id,
          'guest_id',            a.guest_id,
          'first_name',          a.first_name,
          'last_name',           a.last_name,
          'attending',           a.attending,
          'dietary_restriction', a.dietary_restriction,
          'notes',               a.notes
        )
      )
      FROM attendees a
      WHERE a.confirmation_id = c.id
    ), '[]'::JSONB)
  )
  INTO   v_conf
  FROM   confirmations c
  WHERE  c.group_id = v_group.id
  ORDER  BY c.created_at DESC
  LIMIT  1;

  v_result := jsonb_build_object(
    'group', jsonb_build_object(
      'id',              v_group.id,
      'event_id',        v_group.event_id,
      'name',            v_group.name,
      'token',           v_group.token,
      'max_guests',      v_group.max_guests,
      'phone',           v_group.phone,
      'notes',           v_group.notes,
      'whatsapp_status', v_group.whatsapp_status
    ),
    'event', jsonb_build_object(
      'id',                v_event.id,
      'slug',              v_event.slug,
      'name',              v_event.name,
      'title',             v_event.title,
      'subtitle',          v_event.subtitle,
      'welcome_text',      v_event.welcome_text,
      'type',              v_event.type,
      'template_id',       v_event.template_id,
      'template_version',  v_event.template_version,
      'status',            v_event.status,
      'date',              v_event.date,
      'start_time',        v_event.start_time,
      'location',          v_event.location,
      'address',           v_event.address,
      'maps_url',          v_event.maps_url,
      'waze_url',          v_event.waze_url,
      'dress_code',        v_event.dress_code,
      'gifts_text',        v_event.gifts_text,
      'memoroo_url',       v_event.memoroo_url,
      'memoroo_qr_url',    v_event.memoroo_qr_url,
      'cover_image',       v_event.cover_image,
      'schedule',          COALESCE(v_event.schedule, '[]'::JSONB),
      'design_config',     COALESCE(v_event.design_config, '{}'::JSONB),
      'section_config',    COALESCE(v_event.section_config, '{}'::JSONB),
      'whatsapp_template', v_event.whatsapp_template
    ),
    'guests',               v_guests,
    'existing_confirmation', v_conf
  );

  RETURN v_result;
END;
$$;
