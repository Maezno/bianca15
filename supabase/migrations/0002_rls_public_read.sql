-- ============================================================
-- MIGRACIÓN 0002: RLS pública y RPC de invitación
-- ============================================================
-- Objetivo:
--   Permitir que el frontend (anon key) acceda a los datos de
--   UN ÚNICO grupo de invitados mediante su token, sin abrir
--   las tablas completas al acceso público.
--
-- Estrategia: función RPC con SECURITY DEFINER
--   - La función se ejecuta con los permisos del propietario (postgres)
--   - El anon key puede LLAMAR a la función, pero no acceder a las tablas
--   - RLS permanece cerrado para SELECT directo desde el anon key
--   - No se usa service_role en el cliente
-- ============================================================

-- ─── Función RPC: get_invitation_by_token ────────────────────────────────────
--
-- Recibe un token y devuelve los datos del grupo de invitados
-- junto con sus invitados y el estado de confirmación.
--
-- Devuelve JSONB para máxima flexibilidad con el cliente Next.js.
--
-- Campos devueltos (solo los necesarios para la invitación pública):
--   id, name, token, max_guests, guests[], confirmation
--
-- Campos NO devueltos (datos sensibles):
--   phone, notes, internal timestamps de admin
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_invitation_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
-- Fijar search_path para evitar ataques de search_path injection
SET search_path = public
AS $$
DECLARE
  v_group     RECORD;
  v_guests    JSONB;
  v_conf      JSONB;
  v_result    JSONB;
BEGIN
  -- 1. Buscar el grupo por token
  SELECT id, name, token, max_guests
  INTO   v_group
  FROM   guest_groups
  WHERE  token = p_token
  LIMIT  1;

  -- 2. Si no existe, devolver NULL (no lanzar error)
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 3. Obtener los invitados del grupo (solo id y nombre)
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

  -- 4. Obtener la confirmación vigente, si existe
  SELECT jsonb_build_object(
    'status',       c.status,
    'guests_count', c.guests_count
  )
  INTO v_conf
  FROM confirmations c
  WHERE c.group_id = v_group.id
  LIMIT 1;

  -- 5. Construir y devolver el resultado
  v_result := jsonb_build_object(
    'id',           v_group.id,
    'name',         v_group.name,
    'token',        v_group.token,
    'max_guests',   v_group.max_guests,
    'guests',       v_guests,
    'confirmation', v_conf  -- puede ser NULL si no hay confirmación
  );

  RETURN v_result;
END;
$$;

-- Permitir que el rol anon llame a esta función
GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT) TO authenticated;

-- ─── Comentarios de documentación ────────────────────────────────────────────

COMMENT ON FUNCTION get_invitation_by_token(TEXT) IS
'RPC pública (SECURITY DEFINER) que devuelve los datos de un grupo de invitados
 para la invitación personalizada. No expone datos sensibles (phone, notes).
 Puede ser llamada con el anon key sin abrir RLS.';

-- ─── RLS: mantener las tablas bloqueadas para acceso directo anon ─────────────
--
-- Las políticas del Hito 1 (USING false para anon) se mantienen.
-- El acceso público ocurre SOLO a través de la RPC get_invitation_by_token.
--
-- Si en el futuro se necesita acceso directo (ej. en Server Components
-- autenticados), se agregarán políticas específicas aquí.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── FIN DE MIGRACIÓN ─────────────────────────────────────────────────────────
