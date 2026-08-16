-- =====================================================================
-- MIGRACIÓN 0006: Sistema de confirmación de asistencia
-- =====================================================================
-- Estrategia de seguridad:
--   - Las tablas `confirmations` y `attendees` tienen RLS habilitado
--     con políticas USING (false) para anon → sin acceso directo.
--   - Todo el acceso ocurre exclusivamente mediante funciones RPC
--     con SECURITY DEFINER (ejecutan como el propietario de la función).
--   - El cliente NUNCA envía group_id ni event_id:
--     el servidor resuelve token → group → event internamente.
--
-- Atomicidad:
--   - save_confirmation usa una transacción PL/pgSQL implícita.
--   - Si cualquier paso falla (validación, INSERT de attendee, etc.),
--     toda la operación se revierte automáticamente.
--   - No puede quedar una confirmation sin attendees ni viceversa.
-- =====================================================================

-- ── Asegurar UNIQUE constraint en confirmations.group_id ─────────────
-- (necesario para ON CONFLICT en el UPSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'confirmations_group_id_key'
      AND contype = 'u'
  ) THEN
    ALTER TABLE confirmations ADD CONSTRAINT confirmations_group_id_key UNIQUE (group_id);
  END IF;
END;
$$;

-- ── Índice en attendees.confirmation_id (si no existe) ───────────────
CREATE INDEX IF NOT EXISTS idx_attendees_confirmation_id
  ON attendees (confirmation_id);

-- ── Índice en confirmations.group_id ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_confirmations_group_id
  ON confirmations (group_id);

-- ── Índice en guest_groups.token ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_guest_groups_token
  ON guest_groups (token);

-- =====================================================================
-- FUNCIÓN: get_confirmation_by_token
-- Propósito: leer la confirmación actual de un grupo por su token.
-- Seguridad: SECURITY DEFINER, solo recibe el token opaco.
-- Devuelve: JSON con status, guests_count, comment, confirmed_at,
--           y array de attendees [{name, dietary_restriction}].
-- Si no existe confirmación → NULL.
-- =====================================================================
CREATE OR REPLACE FUNCTION get_confirmation_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id     UUID;
  v_conf_id      UUID;
  v_conf_status  TEXT;
  v_guests_count INTEGER;
  v_comment      TEXT;
  v_confirmed_at TIMESTAMPTZ;
  v_attendees    JSONB;
BEGIN
  -- 1. Resolver token → group
  SELECT id INTO v_group_id
  FROM guest_groups
  WHERE token = p_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 2. Buscar confirmación
  SELECT id, status, guests_count, comment, confirmed_at
  INTO v_conf_id, v_conf_status, v_guests_count, v_comment, v_confirmed_at
  FROM confirmations
  WHERE group_id = v_group_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 3. Buscar attendees asociados
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'name',                a.name,
        'dietary_restriction', a.dietary_restriction
      ) ORDER BY a.created_at
    ),
    '[]'::JSONB
  )
  INTO v_attendees
  FROM attendees a
  WHERE a.confirmation_id = v_conf_id;

  -- 4. Devolver resultado (sin UUIDs internos)
  RETURN jsonb_build_object(
    'status',       v_conf_status,
    'guests_count', v_guests_count,
    'comment',      v_comment,
    'confirmed_at', v_confirmed_at,
    'attendees',    v_attendees
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_confirmation_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_confirmation_by_token(TEXT) TO authenticated;

-- =====================================================================
-- FUNCIÓN: save_confirmation
-- Propósito: guardar o actualizar la confirmación de un grupo.
-- Seguridad:
--   - Solo recibe el token (no group_id, no event_id, no confirmation_id).
--   - Valida todo del lado servidor.
--   - UPSERT atómico: si algo falla, toda la operación se revierte.
--
-- Parámetros:
--   p_token        TEXT           -- token del grupo (opaco, de la URL)
--   p_status       TEXT           -- 'confirmed' | 'declined'
--   p_guests_count INTEGER        -- cantidad de personas (0 si declined)
--   p_comment      TEXT           -- mensaje opcional (puede ser vacío)
--   p_attendees    JSONB          -- [{name, dietary_restriction}] (vacío si declined)
--
-- Errores (SQLSTATE):
--   P0001 invalid_token
--   P0002 invalid_status
--   P0003 invalid_guests_count
--   P0004 attendees_count_mismatch
--   P0005 empty_attendee_name
--   P0006 attendee_name_too_long
--   P0007 invalid_dietary_restriction
--   P0008 comment_too_long
-- =====================================================================
CREATE OR REPLACE FUNCTION save_confirmation(
  p_token        TEXT,
  p_status       TEXT,
  p_guests_count INTEGER,
  p_comment      TEXT,
  p_attendees    JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id      UUID;
  v_max_guests    INTEGER;
  v_conf_id       UUID;
  v_attendee      JSONB;
  v_name          TEXT;
  v_dietary       TEXT;
  v_actual_count  INTEGER;
BEGIN
  -- ── 1. Resolver token → group ──────────────────────────────────────
  SELECT id, max_guests
  INTO v_group_id, v_max_guests
  FROM guest_groups
  WHERE token = p_token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  -- ── 2. Validar estado ─────────────────────────────────────────────
  IF p_status NOT IN ('confirmed', 'declined') THEN
    RAISE EXCEPTION 'invalid_status' USING ERRCODE = 'P0002';
  END IF;

  -- ── 3. Validaciones específicas para 'confirmed' ──────────────────
  IF p_status = 'confirmed' THEN
    -- 3a. Validar cantidad de personas
    IF p_guests_count < 1 OR p_guests_count > v_max_guests THEN
      RAISE EXCEPTION 'invalid_guests_count' USING ERRCODE = 'P0003';
    END IF;

    -- 3b. Validar que los attendees coincidan en cantidad
    v_actual_count := jsonb_array_length(p_attendees);
    IF v_actual_count IS DISTINCT FROM p_guests_count THEN
      RAISE EXCEPTION 'attendees_count_mismatch' USING ERRCODE = 'P0004';
    END IF;

    -- 3c. Validar cada attendee
    FOR v_attendee IN SELECT * FROM jsonb_array_elements(p_attendees)
    LOOP
      v_name    := trim(v_attendee->>'name');
      v_dietary := v_attendee->>'dietary_restriction';

      IF v_name IS NULL OR length(v_name) = 0 THEN
        RAISE EXCEPTION 'empty_attendee_name' USING ERRCODE = 'P0005';
      END IF;

      IF length(v_name) > 100 THEN
        RAISE EXCEPTION 'attendee_name_too_long' USING ERRCODE = 'P0006';
      END IF;

      IF v_dietary IS NULL OR length(v_dietary) = 0 THEN
        RAISE EXCEPTION 'invalid_dietary_restriction' USING ERRCODE = 'P0007';
      END IF;

      IF length(v_dietary) > 100 THEN
        RAISE EXCEPTION 'invalid_dietary_restriction' USING ERRCODE = 'P0007';
      END IF;
    END LOOP;

  ELSE
    -- Para 'declined', ignorar attendees y forzar guests_count = 0
    p_guests_count := 0;
    p_attendees    := '[]'::JSONB;
  END IF;

  -- ── 4. Validar comentario ─────────────────────────────────────────
  IF p_comment IS NOT NULL AND length(p_comment) > 500 THEN
    RAISE EXCEPTION 'comment_too_long' USING ERRCODE = 'P0008';
  END IF;

  -- ── 5. UPSERT en confirmations ────────────────────────────────────
  -- ON CONFLICT requiere UNIQUE(group_id), asegurado en el inicio de la migración.
  INSERT INTO confirmations (group_id, status, guests_count, comment, confirmed_at)
  VALUES (
    v_group_id,
    p_status,
    p_guests_count,
    NULLIF(trim(COALESCE(p_comment, '')), ''),
    NOW()
  )
  ON CONFLICT (group_id) DO UPDATE
    SET status       = EXCLUDED.status,
        guests_count = EXCLUDED.guests_count,
        comment      = EXCLUDED.comment,
        confirmed_at = EXCLUDED.confirmed_at,
        updated_at   = NOW()
  RETURNING id INTO v_conf_id;

  -- ── 6. Eliminar attendees anteriores ─────────────────────────────
  DELETE FROM attendees WHERE confirmation_id = v_conf_id;

  -- ── 7. Insertar nuevos attendees (solo si confirmed) ─────────────
  IF p_status = 'confirmed' THEN
    FOR v_attendee IN SELECT * FROM jsonb_array_elements(p_attendees)
    LOOP
      v_name    := trim(v_attendee->>'name');
      v_dietary := v_attendee->>'dietary_restriction';

      INSERT INTO attendees (confirmation_id, name, dietary_restriction)
      VALUES (v_conf_id, v_name, v_dietary);
    END LOOP;
  END IF;

  -- ── 8. Retornar resultado ─────────────────────────────────────────
  RETURN jsonb_build_object(
    'success', true,
    'status',  p_status
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise para que el llamador vea el error específico
    RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION save_confirmation(TEXT, TEXT, INTEGER, TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION save_confirmation(TEXT, TEXT, INTEGER, TEXT, JSONB) TO authenticated;
