-- ============================================================
-- MIGRACIÓN 0001: Esquema inicial — Invitación 15 años de Bianca
-- ============================================================
-- Proyecto: bianca15
-- Fecha: 2026-08-15
--
-- Tablas:
--   1. guest_groups   — Grupos/familias de invitados
--   2. guests         — Personas dentro de un grupo
--   3. confirmations  — Confirmación de asistencia por grupo
--   4. attendees      — Personas que efectivamente asistirán
-- ============================================================

-- ─── Extensiones ─────────────────────────────────────────────────────────────

-- uuid_generate_v4() para generar UUIDs aleatorios seguros
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto para gen_random_uuid() (alternativa moderna, preferida en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enum: estado de confirmación ────────────────────────────────────────────

CREATE TYPE confirmation_status AS ENUM (
  'pending',    -- Sin respuesta aún
  'confirmed',  -- Confirmó asistencia
  'declined'    -- No asistirá
);

-- ─── Tabla: guest_groups ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guest_groups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  -- Token de invitación: identificador aleatorio sin información personal.
  -- Se usa en la URL /i/[token] para acceder a la invitación personalizada.
  token       TEXT        NOT NULL,
  max_guests  INTEGER     NOT NULL DEFAULT 1 CHECK (max_guests > 0),
  phone       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT guest_groups_token_unique UNIQUE (token)
);

COMMENT ON TABLE  guest_groups              IS 'Grupos o familias de invitados';
COMMENT ON COLUMN guest_groups.token        IS 'Token único aleatorio para la URL personalizada';
COMMENT ON COLUMN guest_groups.max_guests   IS 'Cantidad máxima de personas que puede traer el grupo';

-- ─── Tabla: guests ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guests (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID        NOT NULL REFERENCES guest_groups(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  guests          IS 'Personas individuales asociadas a un grupo de invitados';
COMMENT ON COLUMN guests.group_id IS 'FK → guest_groups.id';

-- ─── Tabla: confirmations ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS confirmations (
  id            UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Un grupo solo puede tener UNA confirmación vigente
  group_id      UUID                NOT NULL UNIQUE REFERENCES guest_groups(id) ON DELETE CASCADE,
  status        confirmation_status NOT NULL DEFAULT 'pending',
  guests_count  INTEGER             CHECK (guests_count IS NULL OR guests_count >= 0),
  comment       TEXT,
  confirmed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  confirmations              IS 'Confirmaciones de asistencia por grupo';
COMMENT ON COLUMN confirmations.group_id     IS 'FK → guest_groups.id (UNIQUE: un grupo, una confirmación)';
COMMENT ON COLUMN confirmations.status       IS 'pending | confirmed | declined';
COMMENT ON COLUMN confirmations.guests_count IS 'Cantidad de personas que asistirán según la confirmación';
COMMENT ON COLUMN confirmations.confirmed_at IS 'Timestamp de cuando el grupo confirmó/rechazó';

-- ─── Tabla: attendees ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS attendees (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_id      UUID        NOT NULL REFERENCES confirmations(id) ON DELETE CASCADE,
  name                 TEXT        NOT NULL,
  dietary_restriction  TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  attendees                        IS 'Personas que efectivamente asistirán al evento';
COMMENT ON COLUMN attendees.confirmation_id        IS 'FK → confirmations.id';
COMMENT ON COLUMN attendees.dietary_restriction    IS 'Restricción alimentaria (celíaco, vegetariano, etc.)';

-- ─── Índices ──────────────────────────────────────────────────────────────────

-- guest_groups
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_groups_token
  ON guest_groups(token);

CREATE INDEX IF NOT EXISTS idx_guest_groups_phone
  ON guest_groups(phone)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_guest_groups_name
  ON guest_groups(name);

-- guests
CREATE INDEX IF NOT EXISTS idx_guests_group_id
  ON guests(group_id);

-- confirmations
CREATE INDEX IF NOT EXISTS idx_confirmations_group_id
  ON confirmations(group_id);

CREATE INDEX IF NOT EXISTS idx_confirmations_status
  ON confirmations(status);

-- attendees
CREATE INDEX IF NOT EXISTS idx_attendees_confirmation_id
  ON attendees(confirmation_id);

-- ─── Función: actualizar updated_at automáticamente ──────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_guest_groups_updated_at
  BEFORE UPDATE ON guest_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_confirmations_updated_at
  BEFORE UPDATE ON confirmations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_attendees_updated_at
  BEFORE UPDATE ON attendees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
--
-- ARQUITECTURA DE SEGURIDAD:
--
--   Tipo "público/invitado":
--     Accede con un token de invitación válido.
--     Solo puede ver y modificar los datos de SU PROPIO grupo.
--
--   Tipo "administrador":
--     Accede al panel privado (autenticación completa en Hito 2+).
--     Puede ver y modificar todos los datos.
--
-- IMPORTANTE: No se usan políticas USING (true) que exponen todos los datos.
-- La información personal de los invitados está protegida.
--
-- En Hito 1 se activa RLS sin políticas definitivas.
-- Las políticas completas se implementarán cuando se integre la autenticación.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE guest_groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees       ENABLE ROW LEVEL SECURITY;

-- ─── Política provisional: acceso solo para el rol de servicio ───────────────
--
-- Por ahora solo el service role (backend seguro, nunca expuesto al frontend)
-- puede leer y escribir. Las políticas por token se implementarán en Hito 2.
--
-- NOTA: El service role bypass RLS por defecto en Supabase.
-- Estas políticas controlan el acceso desde el anon key (frontend).

-- guest_groups: sin acceso público directo
CREATE POLICY "guest_groups_no_public_access"
  ON guest_groups
  FOR ALL
  TO anon
  USING (false);

-- guests: sin acceso público directo
CREATE POLICY "guests_no_public_access"
  ON guests
  FOR ALL
  TO anon
  USING (false);

-- confirmations: sin acceso público directo
CREATE POLICY "confirmations_no_public_access"
  ON confirmations
  FOR ALL
  TO anon
  USING (false);

-- attendees: sin acceso público directo
CREATE POLICY "attendees_no_public_access"
  ON attendees
  FOR ALL
  TO anon
  USING (false);

-- ─── FIN DE MIGRACIÓN ─────────────────────────────────────────────────────────
