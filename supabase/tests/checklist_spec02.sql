-- =====================================================================
-- Verificación del Checklist de Mauro (SPEC-02 §6)
-- Uso: pegar TODO en Dashboard → SQL Editor y pulsar Run.
-- Crea datos temporales y al final hace ROLLBACK: no deja nada en la base.
-- Resultado: una tabla con cada ítem del checklist y "ok" true/false.
-- =====================================================================
SET search_path = public, extensions;
BEGIN;

CREATE TEMP TABLE checklist (n int, item text, ok boolean, detalle text) ON COMMIT DROP;

-- ---------- Datos temporales ----------
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'test-dirigente@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'test-padrino@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'test-vulnerable@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a4', 'test-prestador@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a5', 'test-cliente@sumayni.test');

INSERT INTO profiles (id, full_name, phone, home_address, home_location, role, is_vulnerable) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Test Dirigente',  '+51000000001', 'Calle 1', ST_SetSRID(ST_MakePoint(-77.0350, -12.0700), 4326)::geography, 'dirigente', FALSE),
  ('00000000-0000-0000-0000-0000000000a2', 'Test Padrino',    '+51000000002', 'Calle 2', ST_SetSRID(ST_MakePoint(-77.0342, -12.0712), 4326)::geography, 'padrino',   FALSE),
  ('00000000-0000-0000-0000-0000000000a3', 'Test Vulnerable', '+51000000003', 'Calle 3', ST_SetSRID(ST_MakePoint(-77.0356, -12.0705), 4326)::geography, 'vecino',    TRUE),
  ('00000000-0000-0000-0000-0000000000a4', 'Test Prestador',  '+51000000004', 'Calle 4', ST_SetSRID(ST_MakePoint(-77.0365, -12.0690), 4326)::geography, 'vecino',    FALSE),
  ('00000000-0000-0000-0000-0000000000a5', 'Test Cliente',    '+51000000005', 'Calle 5', ST_SetSRID(ST_MakePoint(-77.0330, -12.0725), 4326)::geography, 'vecino',    FALSE);

INSERT INTO neighborhood_groups (id, name, sector_name, leader_id, boundary) VALUES
  ('00000000-0000-0000-0000-0000000000b1', 'Grupo de prueba', 'Sector de prueba', '00000000-0000-0000-0000-0000000000a1',
   ST_GeogFromText('SRID=4326;POLYGON((-77.0400 -12.0750, -77.0300 -12.0750, -77.0300 -12.0660, -77.0400 -12.0660, -77.0400 -12.0750))'));

UPDATE profiles SET group_id = '00000000-0000-0000-0000-0000000000b1'
WHERE id::text LIKE '00000000-0000-0000-0000-0000000000a%';

INSERT INTO services (id, provider_id, title, category, description) VALUES
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a4', 'Gasfitería', 'Gasfitería', 'Servicio de prueba');

INSERT INTO care_assignments (vulnerable_profile_id, buddy_profile_id) VALUES
  ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a2');

-- ---------- 1. Tablas creadas + índice GIST(home_location) ----------
INSERT INTO checklist
SELECT 1, 'Tablas creadas (14) e índice GIST(home_location)',
       t.n = 14 AND i.n = 1,
       format('%s de 14 tablas · %s índice GIST en profiles.home_location', t.n, i.n)
FROM (SELECT count(*)::int n FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN (
        'profiles','neighborhood_groups','group_join_requests','services','reviews','user_favorites',
        'service_reports','neighborhood_news','solidary_posts','emergency_events','care_assignments',
        'chat_conversations','chat_messages','sos_alerts')) t,
     (SELECT count(*)::int n FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'profiles'
        AND indexdef ILIKE '%USING gist%home_location%') i;

INSERT INTO checklist
SELECT 1, 'get_nearby_services devuelve distancias en metros',
       count(*) = 1 AND bool_and(distance_meters BETWEEN 100 AND 500),
       string_agg(format('%s a %s m', provider_name, distance_meters), ', ')
FROM get_nearby_services(-12.0700, -77.0350, 500);

-- ---------- 2. Integridad referencial sin dependencia circular ----------
INSERT INTO checklist
SELECT 2, 'FK profiles.group_id ↔ neighborhood_groups.leader_id',
       count(*) = 2,
       string_agg(conname, ', ')
FROM pg_constraint
WHERE contype = 'f'
  AND ((conrelid = 'public.profiles'::regclass AND conname = 'fk_profiles_group')
    OR (conrelid = 'public.neighborhood_groups'::regclass
        AND confrelid = 'public.profiles'::regclass));

-- ---------- 3. Soporte WhatsApp (inserción con user_id / author_id NULL) ----------
DO $$
BEGIN
  PERFORM set_config('request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;

  INSERT INTO public.group_join_requests (group_id, user_id, whatsapp_phone, full_name, address, is_from_whatsapp)
  VALUES ('00000000-0000-0000-0000-0000000000b1', NULL, '+51999999999', 'Vecina WhatsApp', 'Calle WA', TRUE);

  INSERT INTO public.solidary_posts (author_id, group_id, whatsapp_sender_phone, whatsapp_sender_name,
                                     post_type, category, description, is_from_whatsapp)
  VALUES (NULL, '00000000-0000-0000-0000-0000000000b1', '+51999999999', 'Vecina WhatsApp',
          'AYUDA', 'Herramientas', 'Necesito baldes', TRUE);

  RESET ROLE;
  INSERT INTO checklist VALUES (3, 'Soporte WhatsApp en group_join_requests y solidary_posts', TRUE,
                                'Insertadas una solicitud y una publicación con user_id/author_id NULL');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO checklist VALUES (3, 'Soporte WhatsApp en group_join_requests y solidary_posts', FALSE, SQLERRM);
END $$;

-- ---------- 4. Chat + Realtime ----------
INSERT INTO chat_conversations (id, service_id, client_id, provider_id) VALUES
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1',
   '00000000-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-0000000000a4');
INSERT INTO chat_messages (conversation_id, sender_id, content, is_review_request) VALUES
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000a4', '¿Me das tu Visto Bueno?', TRUE);

INSERT INTO checklist
SELECT 4, 'chat_conversations y chat_messages con Realtime',
       bool_and(tablename IS NOT NULL) AND count(*) = 4,
       'En supabase_realtime: ' || string_agg(tablename, ', ' ORDER BY tablename)
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
  AND tablename IN ('emergency_events', 'solidary_posts', 'group_join_requests', 'chat_messages');

-- ---------- 5. is_dirigente / is_padrino_of sin recursión ----------
DO $$
DECLARE
  v_padrino int; v_cliente int; v_dirigente int;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_padrino FROM public.profiles WHERE is_vulnerable;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_cliente FROM public.profiles WHERE is_vulnerable;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_dirigente FROM public.profiles WHERE is_vulnerable;
  RESET ROLE;

  INSERT INTO checklist VALUES (5, 'is_dirigente() e is_padrino_of() sin recursión en RLS',
    v_padrino = 1 AND v_cliente = 0 AND v_dirigente = 1,
    format('Vulnerables visibles → padrino: %s (esperado 1) · vecino: %s (esperado 0) · dirigente: %s (esperado 1)',
           v_padrino, v_cliente, v_dirigente));
EXCEPTION WHEN OTHERS THEN
  INSERT INTO checklist VALUES (5, 'is_dirigente() e is_padrino_of() sin recursión en RLS', FALSE, SQLERRM);
END $$;

-- ---------- 6. Trigger de rating ----------
INSERT INTO reviews (service_id, client_id, rating, comment) VALUES
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a5', 5, 'Excelente'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1', 2, 'Regular');

INSERT INTO checklist
SELECT 6, 'Trigger de rating tras insertar reseñas',
       rating_average = 3.50 AND reviews_count = 2,
       format('rating_average = %s (esperado 3.50) · reviews_count = %s (esperado 2)', rating_average, reviews_count)
FROM services WHERE id = '00000000-0000-0000-0000-0000000000c1';

-- ---------- 7. Tipos TypeScript ----------
INSERT INTO checklist VALUES (7, 'src/types/database.ts generado', NULL,
  'Se verifica fuera de SQL: npx supabase gen types typescript --linked --schema public');

SELECT n, item, ok, detalle FROM checklist ORDER BY n, item;

ROLLBACK;
