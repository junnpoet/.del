-- =====================================================================
-- Verificación de SPEC-02 §4.1 (políticas para las operaciones de la app)
-- Uso: pegar TODO en el SQL Editor y pulsar Run ("Run without RLS" si avisa).
-- Crea datos temporales, prueba cada operación como un usuario real y
-- termina con ROLLBACK: no deja nada en la base.
-- =====================================================================
SET search_path = public, extensions;
BEGIN;

CREATE TEMP TABLE resultados (n int, operacion text, ok boolean, detalle text) ON COMMIT DROP;

-- ---------- Datos temporales ----------
-- a1 dirigente · a2 padrino · a3 vulnerable · a4 prestador · a5 cliente · a6 vecino nuevo (sin perfil)
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'test-dirigente@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'test-padrino@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'test-vulnerable@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a4', 'test-prestador@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a5', 'test-cliente@sumayni.test'),
  ('00000000-0000-0000-0000-0000000000a6', 'test-nuevo@sumayni.test');

INSERT INTO profiles (id, full_name, phone, home_address, home_location, role, is_vulnerable) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Test Dirigente',  '+51000000001', 'Calle 1', ST_SetSRID(ST_MakePoint(-77.0350, -12.0700), 4326)::geography, 'dirigente', FALSE),
  ('00000000-0000-0000-0000-0000000000a2', 'Test Padrino',    '+51000000002', 'Calle 2', ST_SetSRID(ST_MakePoint(-77.0342, -12.0712), 4326)::geography, 'padrino',   FALSE),
  ('00000000-0000-0000-0000-0000000000a3', 'Test Vulnerable', '+51000000003', 'Calle 3', ST_SetSRID(ST_MakePoint(-77.0356, -12.0705), 4326)::geography, 'vecino',    TRUE),
  ('00000000-0000-0000-0000-0000000000a4', 'Test Prestador',  '+51000000004', 'Calle 4', ST_SetSRID(ST_MakePoint(-77.0365, -12.0690), 4326)::geography, 'vecino',    FALSE),
  ('00000000-0000-0000-0000-0000000000a5', 'Test Cliente',    '+51000000005', 'Calle 5', ST_SetSRID(ST_MakePoint(-77.0330, -12.0725), 4326)::geography, 'vecino',    FALSE);

INSERT INTO neighborhood_groups (id, name, sector_name, leader_id) VALUES
  ('00000000-0000-0000-0000-0000000000b1', 'Grupo de prueba', 'Sector de prueba', '00000000-0000-0000-0000-0000000000a1');

INSERT INTO services (id, provider_id, title, category, description) VALUES
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a4', 'Gasfitería', 'Gasfitería', 'Prueba');

INSERT INTO care_assignments (id, vulnerable_profile_id, buddy_profile_id) VALUES
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a2');

INSERT INTO chat_conversations (id, service_id, client_id, provider_id) VALUES
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1',
   '00000000-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-0000000000a4');
INSERT INTO chat_messages (conversation_id, sender_id, content, is_review_request) VALUES
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000a4', '¿Me das tu Visto Bueno?', TRUE);

INSERT INTO emergency_events (id, group_id, event_type, activated_by) VALUES
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000b1', 'SISMO', '00000000-0000-0000-0000-0000000000a1');

INSERT INTO sos_alerts (sender_id, group_id, location) VALUES
  ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000b1',
   ST_SetSRID(ST_MakePoint(-77.0356, -12.0705), 4326)::geography);

-- ---------- 1. Registro del perfil (a6, vecino nuevo) ----------
DO $$
DECLARE ok_insert boolean; ok_rol boolean; d text := '';
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a6","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;

  BEGIN  -- intento ilegal: registrarse como dirigente
    INSERT INTO profiles (id, full_name, phone, home_address, home_location, role)
    VALUES (auth.uid(), 'Nuevo', '+51000000006', 'Calle 6', 'SRID=4326;POINT(-77.035 -12.07)', 'dirigente');
    ok_rol := FALSE; d := d || 'registrarse como dirigente: PERMITIDO ✗ · ';
  EXCEPTION WHEN insufficient_privilege THEN
    ok_rol := TRUE; d := d || 'registrarse como dirigente: bloqueado ✓ · ';
  END;

  BEGIN  -- registro normal
    INSERT INTO profiles (id, full_name, phone, home_address, home_location)
    VALUES (auth.uid(), 'Nuevo', '+51000000006', 'Calle 6', 'SRID=4326;POINT(-77.035 -12.07)');
    ok_insert := TRUE; d := d || 'registro como vecino: OK ✓';
  EXCEPTION WHEN OTHERS THEN
    ok_insert := FALSE; d := d || 'registro como vecino: ' || SQLERRM;
  END;

  RESET ROLE;
  INSERT INTO resultados VALUES (1, 'Crear perfil al registrarse (profiles INSERT)', ok_insert AND ok_rol, d);
END $$;

-- ---------- 1b. Actualizar el propio perfil sin poder cambiar el rol (a5) ----------
DO $$
DECLARE ok_token boolean; ok_rol boolean; d text := ''; filas int;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;

  UPDATE profiles SET push_token = 'ExponentPushToken[test]' WHERE id = auth.uid();
  GET DIAGNOSTICS filas = ROW_COUNT;
  ok_token := filas = 1; d := d || format('guardar push_token: %s fila(s) · ', filas);

  BEGIN
    UPDATE profiles SET role = 'dirigente' WHERE id = auth.uid();
    ok_rol := FALSE; d := d || 'cambiarse el rol: PERMITIDO ✗';
  EXCEPTION WHEN insufficient_privilege THEN
    ok_rol := TRUE; d := d || 'cambiarse el rol: bloqueado ✓';
  END;

  RESET ROLE;
  INSERT INTO resultados VALUES (1, 'Actualizar el propio perfil (push_token)', ok_token AND ok_rol, d);
END $$;

-- ---------- 2. Visto Bueno (a5 con solicitud · a1 sin chat) ----------
DO $$
DECLARE ok_cliente boolean; ok_ajeno boolean; d text := '';
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO reviews (service_id, client_id, rating, comment)
    VALUES ('00000000-0000-0000-0000-0000000000c1', auth.uid(), 5, 'Excelente');
    ok_cliente := TRUE; d := d || 'cliente con solicitud: OK ✓ · ';
  EXCEPTION WHEN OTHERS THEN
    ok_cliente := FALSE; d := d || 'cliente con solicitud: ' || SQLERRM || ' · ';
  END;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO reviews (service_id, client_id, rating) VALUES ('00000000-0000-0000-0000-0000000000c1', auth.uid(), 1);
    ok_ajeno := FALSE; d := d || 'sin chat previo: PERMITIDO ✗';
  EXCEPTION WHEN insufficient_privilege THEN
    ok_ajeno := TRUE; d := d || 'sin chat previo: bloqueado ✓';
  END;
  RESET ROLE;

  INSERT INTO resultados VALUES (2, 'Otorgar Visto Bueno (reviews INSERT)', ok_cliente AND ok_ajeno,
    d || format(' · rating ahora: %s', (SELECT rating_average FROM services WHERE id = '00000000-0000-0000-0000-0000000000c1')));
END $$;

-- ---------- 3. Red de cuidado ----------
DO $$
DECLARE v_padrino int; v_vecino int; filas int; ok_asignar boolean; d text;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_padrino FROM care_assignments;
  UPDATE care_assignments SET status = 'SEGUIMIENTO_REQUERIDO', updated_at = NOW()
  WHERE id = '00000000-0000-0000-0000-0000000000e1';
  GET DIAGNOSTICS filas = ROW_COUNT;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_vecino FROM care_assignments;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    -- Nombra padrino al prestador (a4); a5 sigue siendo vecina sin relación (prueba 6)
    INSERT INTO care_assignments (vulnerable_profile_id, buddy_profile_id)
    VALUES ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a4');
    ok_asignar := TRUE;
  EXCEPTION WHEN OTHERS THEN ok_asignar := FALSE;
  END;
  RESET ROLE;

  d := format('padrino ve %s (esp. 1) · vecino ve %s (esp. 0) · padrino actualiza %s fila (esp. 1) · dirigente asigna: %s',
              v_padrino, v_vecino, filas, CASE WHEN ok_asignar THEN 'OK' ELSE 'falló' END);
  INSERT INTO resultados VALUES (3, 'Leer y asignar padrinos (care_assignments)',
    v_padrino = 1 AND v_vecino = 0 AND filas = 1 AND ok_asignar, d);
END $$;

-- ---------- 4. Noticias zonales ----------
DO $$
DECLARE ok_dir boolean; ok_vec boolean;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO neighborhood_news (sector_name, title, content, source) VALUES ('Sector de prueba', 'Corte de agua', 'Jueves 8-16 h', 'DIRIGENCIA');
    ok_dir := TRUE;
  EXCEPTION WHEN OTHERS THEN ok_dir := FALSE;
  END;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO neighborhood_news (sector_name, title, content) VALUES ('Sector de prueba', 'Falsa', 'Spam');
    ok_vec := FALSE;
  EXCEPTION WHEN insufficient_privilege THEN ok_vec := TRUE;
  END;
  RESET ROLE;

  INSERT INTO resultados VALUES (4, 'Publicar noticias zonales (neighborhood_news INSERT)', ok_dir AND ok_vec,
    format('dirigente publica: %s · vecino publica: %s',
           CASE WHEN ok_dir THEN 'OK ✓' ELSE 'falló ✗' END,
           CASE WHEN ok_vec THEN 'bloqueado ✓' ELSE 'PERMITIDO ✗' END));
END $$;

-- ---------- 5. Cerrar una emergencia ----------
DO $$
DECLARE f_vecino int; f_dir int;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  UPDATE emergency_events SET status = 'RESOLVED' WHERE id = '00000000-0000-0000-0000-0000000000f1';
  GET DIAGNOSTICS f_vecino = ROW_COUNT;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  UPDATE emergency_events SET status = 'RESOLVED' WHERE id = '00000000-0000-0000-0000-0000000000f1';
  GET DIAGNOSTICS f_dir = ROW_COUNT;
  RESET ROLE;

  INSERT INTO resultados VALUES (5, 'Cerrar una emergencia (emergency_events UPDATE)', f_vecino = 0 AND f_dir = 1,
    format('vecino cierra %s fila (esp. 0) · dirigente cierra %s fila (esp. 1)', f_vecino, f_dir));
END $$;

-- ---------- 6. sos_alerts y neighborhood_groups con RLS ----------
DO $$
DECLARE s_vecino int; s_padrino int; s_dir int; g_vecino int; ok_sos boolean; ok_grupo boolean;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO sos_alerts (sender_id, location) VALUES (auth.uid(), 'SRID=4326;POINT(-77.0356 -12.0705)');
    ok_sos := TRUE;
  EXCEPTION WHEN OTHERS THEN ok_sos := FALSE;
  END;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO s_vecino FROM sos_alerts;
  SELECT count(*) INTO g_vecino FROM neighborhood_groups;
  BEGIN
    INSERT INTO neighborhood_groups (name, sector_name) VALUES ('Grupo pirata', 'X');
    ok_grupo := FALSE;
  EXCEPTION WHEN insufficient_privilege THEN ok_grupo := TRUE;
  END;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO s_padrino FROM sos_alerts;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO s_dir FROM sos_alerts;
  RESET ROLE;

  INSERT INTO resultados VALUES (6, 'sos_alerts y neighborhood_groups protegidas',
    ok_sos AND s_vecino = 0 AND s_padrino = 2 AND s_dir = 2 AND g_vecino >= 1 AND ok_grupo,
    format('vulnerable envía SOS: %s · SOS visibles → vecino %s (esp. 0), padrino %s (esp. 2), dirigente %s (esp. 2) · vecino ve grupos: %s · vecino crea grupo: %s',
           CASE WHEN ok_sos THEN 'OK' ELSE 'falló' END, s_vecino, s_padrino, s_dir, g_vecino,
           CASE WHEN ok_grupo THEN 'bloqueado ✓' ELSE 'PERMITIDO ✗' END));
END $$;

SELECT n, operacion, ok, detalle FROM resultados ORDER BY n, operacion;

ROLLBACK;
