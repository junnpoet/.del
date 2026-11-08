-- =====================================================================
-- SPEC-02 · Seed de Usuarios de Prueba (docs/TEST_USERS.md)
-- Contraseña unificada para pruebas: Sumayni2026!
-- Uso: Pegar en Supabase Dashboard → SQL Editor y presionar RUN.
-- =====================================================================
SET search_path = public, extensions;

-- 1. Habilitar pgcrypto si no está activo
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Limpieza previa por teléfono para evitar conflictos
DELETE FROM public.solidary_posts WHERE author_id IN (
  SELECT id FROM public.profiles WHERE phone IN ('998877665', '991122334', '987654321', '976543210')
);
DELETE FROM public.care_assignments WHERE vulnerable_profile_id IN (
  SELECT id FROM public.profiles WHERE phone IN ('998877665', '991122334', '987654321', '976543210')
) OR buddy_profile_id IN (
  SELECT id FROM public.profiles WHERE phone IN ('998877665', '991122334', '987654321', '976543210')
);
DELETE FROM public.group_join_requests WHERE user_id IN (
  SELECT id FROM public.profiles WHERE phone IN ('998877665', '991122334', '987654321', '976543210')
);
DELETE FROM public.services WHERE provider_id IN (
  SELECT id FROM public.profiles WHERE phone IN ('998877665', '991122334', '987654321', '976543210')
);
DELETE FROM public.profiles WHERE phone IN ('998877665', '991122334', '987654321', '976543210');
DELETE FROM auth.users WHERE email IN (
  '998877665@sumayni.pe',
  '991122334@sumayni.pe',
  '987654321@sumayni.pe',
  '976543210@sumayni.pe'
);

-- 3. Crear usuarios en auth.users (Confirmados con bcrypt de 'Sumayni2026!')
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  '998877665@sumayni.pe',
  extensions.crypt('Sumayni2026!', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Carmen Rosa Mamani","phone":"998877665"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  '991122334@sumayni.pe',
  extensions.crypt('Sumayni2026!', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Elena Mendoza","phone":"991122334"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  '987654321@sumayni.pe',
  extensions.crypt('Sumayni2026!', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Segundo Morales","phone":"987654321"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'authenticated',
  'authenticated',
  '976543210@sumayni.pe',
  extensions.crypt('Sumayni2026!', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Jacinto Valdés","phone":"976543210"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 4. Registrar identidades en auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"998877665@sumayni.pe"}',
  'email',
  '998877665@sumayni.pe',
  NOW(),
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"991122334@sumayni.pe"}',
  'email',
  '991122334@sumayni.pe',
  NOW(),
  NOW(),
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  '{"sub":"33333333-3333-3333-3333-333333333333","email":"987654321@sumayni.pe"}',
  'email',
  '987654321@sumayni.pe',
  NOW(),
  NOW(),
  NOW()
),
(
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  '{"sub":"44444444-4444-4444-4444-444444444444","email":"976543210@sumayni.pe"}',
  'email',
  '976543210@sumayni.pe',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider, provider_id) DO UPDATE SET
  last_sign_in_at = NOW();

-- 5. Crear grupo barrial Sector 4
INSERT INTO public.neighborhood_groups (id, name, sector_name, leader_id, boundary)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Junta Vecinal Sector 4 - Los Jazmines',
  'Sector 4',
  '22222222-2222-2222-2222-222222222222',
  ST_GeogFromText('SRID=4326;POLYGON((-77.0850 -12.0150, -77.0780 -12.0150, -77.0780 -12.0090, -77.0850 -12.0090, -77.0850 -12.0150))')
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  leader_id = EXCLUDED.leader_id,
  boundary = EXCLUDED.boundary;

-- 6. Crear perfiles en public.profiles
INSERT INTO public.profiles (id, full_name, phone, home_address, home_location, role, is_vulnerable, group_id)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Carmen Rosa Mamani',
  '998877665',
  'Jr. Los Jazmines 340, Sector 4',
  ST_SetSRID(ST_MakePoint(-77.0815, -12.0125), 4326)::geography,
  'vecino',
  FALSE,
  NULL
),
(
  '22222222-2222-2222-2222-222222222222',
  'Elena Mendoza',
  '991122334',
  'Jr. Los Jazmines 310, Mz. D Lt. 4',
  ST_SetSRID(ST_MakePoint(-77.0810, -12.0120), 4326)::geography,
  'dirigente',
  FALSE,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Don Segundo Morales',
  '987654321',
  'Jr. Los Jazmines 380, Sector 4',
  ST_SetSRID(ST_MakePoint(-77.0805, -12.0118), 4326)::geography,
  'vecino',
  FALSE,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Don Jacinto Valdés',
  '976543210',
  'Calle Las Dalias 120, Mz. C Lt. 8',
  ST_SetSRID(ST_MakePoint(-77.0825, -12.0135), 4326)::geography,
  'vecino',
  TRUE,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- 7. Servicios independientes: Don Segundo Morales (Gasfitería)
INSERT INTO public.services (id, provider_id, title, category, description, rating_average, reviews_count)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'Gasfitería y Fugas de Agua',
  'Gasfitería',
  'Detección y reparación de fugas, cambio de griferías, desatoro y mantenimiento general en el barrio.',
  4.90,
  38
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  rating_average = EXCLUDED.rating_average,
  reviews_count = EXCLUDED.reviews_count;

-- 8. Red de Cuidado Vecinal: Don Jacinto Valdés acompañado por dirigenta Elena Mendoza
INSERT INTO public.care_assignments (id, vulnerable_profile_id, buddy_profile_id, status, notes)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'SEGUIMIENTO_REQUERIDO',
  'Adulto mayor de 82 años. Requiere apoyo para compras pesadas de víveres y seguimiento semanal.'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- 9. Solicitudes de ingreso pendientes para el panel de Elena (Carmen y WhatsApp)
INSERT INTO public.group_join_requests (id, group_id, user_id, whatsapp_phone, full_name, address, status, is_emergency, is_from_whatsapp)
VALUES
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  NULL,
  'Carmen Rosa Mamani',
  'Jr. Los Jazmines 340, Sector 4',
  'PENDING',
  FALSE,
  FALSE
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  NULL,
  '+51994455667',
  'Jorge Huamán',
  'Jr. Los Jazmines 325, Sector 4',
  'PENDING',
  FALSE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 10. Publicación solidaria de Don Jacinto en el Muro
INSERT INTO public.solidary_posts (id, author_id, group_id, post_type, category, description, urgency, status)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '44444444-4444-4444-4444-444444444444',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'AYUDA',
  'Adulto Mayor',
  'Apoyo para compras de mercado pesadas (sacos de verduras y bidones de agua) los martes por la mañana.',
  'MEDIA',
  'OPEN'
)
ON CONFLICT (id) DO NOTHING;
