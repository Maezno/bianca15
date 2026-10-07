-- ============================================================
-- MIGRACIÓN 0013: RPC administrativo para eliminar grupos con SECURITY DEFINER
-- ============================================================

CREATE OR REPLACE FUNCTION delete_guest_group_by_id(p_group_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted RECORD;
BEGIN
  DELETE FROM guest_groups WHERE id = p_group_id
  RETURNING id, name INTO v_deleted;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'deleted_id', v_deleted.id, 'name', v_deleted.name);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Grupo no encontrado');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_guest_group_by_id(UUID) TO anon;
GRANT EXECUTE ON FUNCTION delete_guest_group_by_id(UUID) TO authenticated;
