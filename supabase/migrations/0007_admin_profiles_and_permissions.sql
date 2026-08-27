-- =====================================================================
-- MIGRACIÓN 0007: Perfiles de administrador, asignaciones y RLS
-- =====================================================================
-- Soporte para dos roles administrativos:
--   - super_admin: Acceso completo a todos los eventos y gestión global.
--   - event_admin: Acceso restringido exclusivamente a eventos asignados en `event_admins`.
-- =====================================================================

-- ── 1. Tabla de Perfiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'event_admin' CHECK (role IN ('super_admin', 'event_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Tabla de Asignación de Administradores a Eventos ───────────────
CREATE TABLE IF NOT EXISTS event_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_admins_user_id ON event_admins (user_id);
CREATE INDEX IF NOT EXISTS idx_event_admins_event_id ON event_admins (event_id);

-- ── 3. Funciones auxiliares de permisos (SECURITY DEFINER) ───────────
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION can_manage_event(p_user_id UUID, p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    is_super_admin(p_user_id) OR
    EXISTS (
      SELECT 1 FROM event_admins
      WHERE user_id = p_user_id AND event_id = p_event_id
    )
  );
$$;

-- ── 4. Trigger para creación automática de Profile en auth.users ──────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'event_admin')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name),
        updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 5. Habilitar RLS en profiles y event_admins ───────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_admins ENABLE ROW LEVEL SECURITY;

-- Políticas en profiles
DROP POLICY IF EXISTS "profiles_select_own_or_superadmin" ON profiles;
CREATE POLICY "profiles_select_own_or_superadmin" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "profiles_update_superadmin" ON profiles;
CREATE POLICY "profiles_update_superadmin" ON profiles
  FOR UPDATE TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Políticas en event_admins
DROP POLICY IF EXISTS "event_admins_select_policy" ON event_admins;
CREATE POLICY "event_admins_select_policy" ON event_admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "event_admins_manage_superadmin" ON event_admins;
CREATE POLICY "event_admins_manage_superadmin" ON event_admins
  FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- ── 6. Actualizar Políticas RLS en tablas de Eventos y Datos ──────────
-- events
DROP POLICY IF EXISTS "events_admin_manage" ON events;
CREATE POLICY "events_admin_manage" ON events
  FOR ALL TO authenticated
  USING (can_manage_event(auth.uid(), id))
  WITH CHECK (is_super_admin(auth.uid()) OR can_manage_event(auth.uid(), id));

-- guest_groups
DROP POLICY IF EXISTS "guest_groups_admin_manage" ON guest_groups;
CREATE POLICY "guest_groups_admin_manage" ON guest_groups
  FOR ALL TO authenticated
  USING (can_manage_event(auth.uid(), event_id))
  WITH CHECK (can_manage_event(auth.uid(), event_id));

-- guests
DROP POLICY IF EXISTS "guests_admin_manage" ON guests;
CREATE POLICY "guests_admin_manage" ON guests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guest_groups
      WHERE guest_groups.id = guests.group_id
        AND can_manage_event(auth.uid(), guest_groups.event_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM guest_groups
      WHERE guest_groups.id = guests.group_id
        AND can_manage_event(auth.uid(), guest_groups.event_id)
    )
  );

-- confirmations
DROP POLICY IF EXISTS "confirmations_admin_manage" ON confirmations;
CREATE POLICY "confirmations_admin_manage" ON confirmations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guest_groups
      WHERE guest_groups.id = confirmations.group_id
        AND can_manage_event(auth.uid(), guest_groups.event_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM guest_groups
      WHERE guest_groups.id = confirmations.group_id
        AND can_manage_event(auth.uid(), guest_groups.event_id)
    )
  );

-- attendees
DROP POLICY IF EXISTS "attendees_admin_manage" ON attendees;
CREATE POLICY "attendees_admin_manage" ON attendees
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM confirmations
      JOIN guest_groups ON guest_groups.id = confirmations.group_id
      WHERE confirmations.id = attendees.confirmation_id
        AND can_manage_event(auth.uid(), guest_groups.event_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM confirmations
      JOIN guest_groups ON guest_groups.id = confirmations.group_id
      WHERE confirmations.id = attendees.confirmation_id
        AND can_manage_event(auth.uid(), guest_groups.event_id)
    )
  );
