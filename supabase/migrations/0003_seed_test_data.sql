-- ============================================================
-- MIGRACIÓN 0003: Datos de prueba
-- ============================================================
-- Propósito: seed con grupos ficticios para desarrollo y testing.
-- NUNCA usar datos reales de invitados aquí.
--
-- Grupos creados:
--   1. Familia Pérez   — cupo 5, 4 personas
--   2. Juan García     — cupo 1, 1 persona
--   3. Familia Rodríguez — cupo 4, 0 personas
--
-- Tokens fijos para facilitar las pruebas (en producción
-- se generarán aleatoriamente desde la aplicación).
-- ============================================================

-- ─── Familia Pérez ────────────────────────────────────────────────────────────

INSERT INTO guest_groups (id, name, token, max_guests, phone, notes)
VALUES (
  'aaaaaaaa-0001-0001-0001-000000000001',
  'Familia Pérez',
  'perez-test1',
  5,
  NULL,
  'Grupo de prueba 1'
);

INSERT INTO guests (group_id, name) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Juan Pérez'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'María Pérez'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Pedro Pérez'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Ana Pérez');

-- ─── Juan García ──────────────────────────────────────────────────────────────

INSERT INTO guest_groups (id, name, token, max_guests, phone, notes)
VALUES (
  'aaaaaaaa-0002-0002-0002-000000000002',
  'Juan García',
  'garcia-test2',
  1,
  NULL,
  'Grupo de prueba 2 — invitado individual'
);

INSERT INTO guests (group_id, name) VALUES
  ('aaaaaaaa-0002-0002-0002-000000000002', 'Juan García');

-- ─── Familia Rodríguez (sin personas asociadas todavía) ──────────────────────

INSERT INTO guest_groups (id, name, token, max_guests, phone, notes)
VALUES (
  'aaaaaaaa-0003-0003-0003-000000000003',
  'Familia Rodríguez',
  'rodriguez-test3',
  4,
  NULL,
  'Grupo de prueba 3 — sin invitados individuales cargados'
);

-- Sin INSERT en guests para este grupo (caso de grupo sin personas)

-- ─── FIN DE SEED ──────────────────────────────────────────────────────────────
--
-- Para probar en el navegador:
--   /i/perez-test1       → Familia Pérez con 4 personas
--   /i/garcia-test2      → Juan García individual
--   /i/rodriguez-test3   → Familia Rodríguez sin personas
--   /i/token-inexistente → Página de invitación no encontrada
--
