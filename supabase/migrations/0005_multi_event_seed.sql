-- ============================================================
-- MIGRACIÓN 0005: Seed Multi-Evento (Datos de prueba aislados)
-- ============================================================
-- Propósito:
--   Cargar al menos DOS eventos ficticios e independientes con sus
--   respectivos grupos e invitados para validar el aislamiento.
-- ============================================================

-- ─── 1. EVENTO 1: Bianca - 15 años ──────────────────────────────────────────

INSERT INTO events (
  id,
  slug,
  name,
  title,
  type,
  template_id,
  status,
  date,
  start_time,
  location,
  address,
  maps_url,
  waze_url,
  dress_code,
  gifts_text,
  memoroo_url,
  memoroo_qr_url
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'bianca-15',
  'Bianca - 15 años',
  'Mis 15 años',
  '15_years',
  'wonderland',
  'published',
  '2026-11-21',
  '21:00',
  'Salón Las Camelias',
  'Av. Libertador 4500, Buenos Aires',
  'https://maps.google.com/?q=Salon+Las+Camelias',
  'https://waze.com/ul?q=Salon+Las+Camelias',
  'Elegante Sport / Formal',
  'Tu presencia es nuestro mejor regalo. Si deseás hacernos un presente, podés colaborar con nuestra alcancía.',
  'https://memoroo.app/e/bianca15',
  'https://memoroo.app/qr/bianca15.png'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  template_id = EXCLUDED.template_id,
  status = EXCLUDED.status;

-- Grupos para Bianca
INSERT INTO guest_groups (id, event_id, name, token, max_guests, notes)
VALUES
  ('11111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Familia Pérez', 'perez-test1', 5, 'Familia amiga')
ON CONFLICT (token) DO UPDATE SET event_id = EXCLUDED.event_id, name = EXCLUDED.name, max_guests = EXCLUDED.max_guests;

DELETE FROM guests WHERE group_id = '11111111-0001-0001-0001-000000000001';
INSERT INTO guests (group_id, name) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Juan Pérez'),
  ('11111111-0001-0001-0001-000000000001', 'María Pérez'),
  ('11111111-0001-0001-0001-000000000001', 'Pedro Pérez'),
  ('11111111-0001-0001-0001-000000000001', 'Ana Pérez');

INSERT INTO guest_groups (id, event_id, name, token, max_guests, notes)
VALUES
  ('11111111-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'Familia García', 'garcia-test2', 2, 'Compañeros de colegio')
ON CONFLICT (token) DO UPDATE SET event_id = EXCLUDED.event_id, name = EXCLUDED.name, max_guests = EXCLUDED.max_guests;

DELETE FROM guests WHERE group_id = '11111111-0002-0002-0002-000000000002';
INSERT INTO guests (group_id, name) VALUES
  ('11111111-0002-0002-0002-000000000002', 'Juan García'),
  ('11111111-0002-0002-0002-000000000002', 'Laura Gómez');


-- ─── 2. EVENTO 2: Juan y María - Nuestra boda (Totalmente independiente) ─────

INSERT INTO events (
  id,
  slug,
  name,
  title,
  type,
  template_id,
  status,
  date,
  start_time,
  location,
  address,
  maps_url,
  waze_url,
  dress_code,
  gifts_text,
  memoroo_url,
  memoroo_qr_url
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'juan-y-maria',
  'Juan y María',
  'Nuestra Boda',
  'wedding',
  'elegant',
  'published',
  '2026-12-12',
  '19:30',
  'Quinta Los Robles',
  'Ruta 8 Km 54, Pilar',
  'https://maps.google.com/?q=Quinta+Los+Robles+Pilar',
  'https://waze.com/ul?q=Quinta+Los+Robles+Pilar',
  'Black Tie / Gala',
  'CBU: 0000003100010000000000 - Alias: BODA.JUAN.MARIA',
  'https://memoroo.app/e/juanymaria',
  'https://memoroo.app/qr/juanymaria.png'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  template_id = EXCLUDED.template_id,
  status = EXCLUDED.status;

-- Grupos para Juan y María (Aislados)
INSERT INTO guest_groups (id, event_id, name, token, max_guests, notes)
VALUES
  ('22222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'Familia Rodríguez', 'rodriguez-boda', 4, 'Padrinos')
ON CONFLICT (token) DO UPDATE SET event_id = EXCLUDED.event_id, name = EXCLUDED.name, max_guests = EXCLUDED.max_guests;

DELETE FROM guests WHERE group_id = '22222222-0001-0001-0001-000000000001';
INSERT INTO guests (group_id, name) VALUES
  ('22222222-0001-0001-0001-000000000001', 'Roberto Rodríguez'),
  ('22222222-0001-0001-0001-000000000001', 'Carmen Díaz'),
  ('22222222-0001-0001-0001-000000000001', 'Sofía Rodríguez');

INSERT INTO guest_groups (id, event_id, name, token, max_guests, notes)
VALUES
  ('22222222-0002-0002-0002-000000000002', '22222222-2222-2222-2222-222222222222', 'Carlos Gómez', 'carlos-individual', 1, 'Amigo de Juan')
ON CONFLICT (token) DO UPDATE SET event_id = EXCLUDED.event_id, name = EXCLUDED.name, max_guests = EXCLUDED.max_guests;

-- ─── FIN DE SEED MULTI-EVENTO ────────────────────────────────────────────────
