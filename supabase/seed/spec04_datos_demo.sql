-- =====================================================================
-- SPEC-04 · Datos de demostración para la Capa Privada
--
-- Por qué existe: en la base actual todos los perfiles son 'vecino', nadie
-- pertenece a una junta vecinal y no hay padrinos ni personas vulnerables.
-- Sin eso, el Muro Solidario está bloqueado para todos y el Panel del
-- Dirigente, la Red de Cuidado y el Modo Accesible no tienen con qué trabajar.
--
-- La app no permite que un usuario se cambie el rol ni se meta solo a un grupo
-- (RLS de la SPEC-02), así que esto lo debe ejecutar alguien con acceso al
-- proyecto: Supabase → SQL Editor → pegar → Run. Se puede ejecutar varias
-- veces sin duplicar datos.
--
-- ANTES:
--   1. Aplicar supabase/migrations/20261108160000_spec04_capa_privada.sql.
--   2. Crear desde la app (Crear cuenta y registrar domicilio) las tres cuentas
--      de abajo y escribir aquí sus correos.
-- =====================================================================
SET search_path = public, extensions;

DO $$
DECLARE
  -- ✏️  Correos de cuentas que YA existen en la app:
  v_dirigente_email  text := 'dirigente@ejemplo.com';      -- verá el Panel del Dirigente
  v_padrino_email    text := 'padrino@ejemplo.com';        -- verá la Red de Cuidado
  v_vulnerable_email text := 'adulto.mayor@ejemplo.com';   -- usará el Modo Accesible
  -- Otros vecinos ya registrados que quieras admitir directo al Muro (opcional):
  v_miembros_emails  text[] := ARRAY[]::text[];

  v_dirigente  uuid;
  v_padrino    uuid;
  v_vulnerable uuid;
  v_group      uuid;
  v_phone      text;
BEGIN
  SELECT p.id INTO v_dirigente FROM auth.users u JOIN profiles p ON p.id = u.id
   WHERE lower(u.email) = lower(v_dirigente_email);
  SELECT p.id INTO v_padrino FROM auth.users u JOIN profiles p ON p.id = u.id
   WHERE lower(u.email) = lower(v_padrino_email);
  SELECT p.id INTO v_vulnerable FROM auth.users u JOIN profiles p ON p.id = u.id
   WHERE lower(u.email) = lower(v_vulnerable_email);

  IF v_dirigente IS NULL OR v_padrino IS NULL OR v_vulnerable IS NULL THEN
    RAISE EXCEPTION 'Falta alguna cuenta (dirigente=%, padrino=%, vulnerable=%). Créalas desde la app y revisa los correos.',
      v_dirigente IS NOT NULL, v_padrino IS NOT NULL, v_vulnerable IS NOT NULL;
  END IF;

  -- 1. Junta vecinal del Sector 4 (polígono aproximado alrededor de Jr. Los Jazmines).
  SELECT id INTO v_group FROM neighborhood_groups WHERE name = 'Junta Vecinal Sector 4' LIMIT 1;
  IF v_group IS NULL THEN
    INSERT INTO neighborhood_groups (name, sector_name, leader_id, boundary)
    VALUES (
      'Junta Vecinal Sector 4',
      'Sector 4',
      v_dirigente,
      ST_GeogFromText('SRID=4326;POLYGON((-77.0860 -12.0100, -77.0770 -12.0100, -77.0770 -12.0160, -77.0860 -12.0160, -77.0860 -12.0100))')
    )
    RETURNING id INTO v_group;
  ELSE
    UPDATE neighborhood_groups SET leader_id = v_dirigente WHERE id = v_group;
  END IF;

  -- 2. Roles y membresía.
  UPDATE profiles SET role = 'dirigente', group_id = v_group WHERE id = v_dirigente;
  UPDATE profiles SET role = 'padrino',   group_id = v_group WHERE id = v_padrino;
  UPDATE profiles SET is_vulnerable = TRUE, group_id = v_group WHERE id = v_vulnerable;
  UPDATE profiles SET group_id = v_group
   WHERE id IN (SELECT u.id FROM auth.users u
                 WHERE lower(u.email) = ANY (SELECT lower(e) FROM unnest(v_miembros_emails) AS e));

  -- 3. Padrinazgo: el padrino acompaña a la persona vulnerable.
  INSERT INTO care_assignments (vulnerable_profile_id, buddy_profile_id, status, notes, updated_at)
  SELECT v_vulnerable, v_padrino, 'AL_DIA', 'Visita semanal: compras y medicinas.', NOW() - INTERVAL '2 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM care_assignments
     WHERE vulnerable_profile_id = v_vulnerable AND buddy_profile_id = v_padrino
  );

  -- 4. Publicaciones de ejemplo en el Muro (solo si el muro del grupo está vacío).
  --    La de WhatsApp usa el celular del dirigente, para no apuntar a un número ajeno.
  SELECT phone INTO v_phone FROM profiles WHERE id = v_dirigente;
  IF NOT EXISTS (SELECT 1 FROM solidary_posts WHERE group_id = v_group) THEN
    INSERT INTO solidary_posts
      (author_id, group_id, post_type, category, description, urgency, is_from_whatsapp, whatsapp_sender_name, whatsapp_sender_phone)
    VALUES
      (v_padrino,    v_group, 'PRESTAMO',     'Préstamo',          'Presto escalera telescópica el fin de semana para limpieza o techado.', 'BAJA',         FALSE, NULL, NULL),
      (v_dirigente,  v_group, 'VOLUNTARIADO', 'Voluntariado',      'Faena de limpieza del parque el sábado a las 9:00 a. m. Traer escobas y bolsas.', 'MEDIA', FALSE, NULL, NULL),
      (v_vulnerable, v_group, 'AYUDA',        'Compras de mercado','Necesito apoyo para traer las compras pesadas del mercado.', 'ALTA_CRITICA', FALSE, NULL, NULL),
      (NULL,         v_group, 'DONACION',     'Donación',          'Dono libros escolares de primaria en buen estado.', 'BAJA', TRUE, 'Vecina por WhatsApp (demo)', v_phone);
  END IF;

  -- 5. Una solicitud de ingreso pendiente llegada por WhatsApp, para el Panel del Dirigente.
  INSERT INTO group_join_requests (group_id, full_name, address, whatsapp_phone, is_from_whatsapp, status)
  SELECT v_group, 'Jorge Huamán (demo)', 'Calle Las Dalias 180, Mz. C Lt. 14', NULL, TRUE, 'PENDING'
  WHERE NOT EXISTS (
    SELECT 1 FROM group_join_requests WHERE group_id = v_group AND full_name = 'Jorge Huamán (demo)'
  );

  RAISE NOTICE 'Listo: grupo %, dirigente %, padrino %, vulnerable %', v_group, v_dirigente, v_padrino, v_vulnerable;
END $$;
