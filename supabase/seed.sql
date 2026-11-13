-- =====================================================================
-- Supabase Seed: 5 Usuarios de Prueba y Datos de Urb. Bellamar
-- Espejo fiel de docs/TEST_USERS.md (Contraseña unificada: 123456)
-- =====================================================================
SET search_path = public, extensions;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Limpieza previa en orden de dependencias
DELETE FROM public.chat_messages;
DELETE FROM public.chat_conversations;
DELETE FROM public.volunteers;
DELETE FROM public.solidary_comments;
DELETE FROM public.solidary_posts;
DELETE FROM public.care_assignments;
DELETE FROM public.emergency_events;
DELETE FROM public.sos_alerts;
DELETE FROM public.service_reports;
DELETE FROM public.user_favorites;
DELETE FROM public.reviews;
DELETE FROM public.services;
DELETE FROM public.group_join_requests;
DELETE FROM public.neighborhood_news;
DELETE FROM public.neighborhood_groups;
DELETE FROM public.profiles WHERE phone IN ('947411396', '971825787', '935860401', '907530293', '947646767');
DELETE FROM auth.users WHERE email IN (
  '947411396@sumayni.pe',
  '971825787@sumayni.pe',
  '935860401@sumayni.pe',
  '907530293@sumayni.pe',
  '947646767@sumayni.pe'
);

-- 2. Crear usuarios en auth.users (Contraseña: 123456)
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
  '01258287-49a3-49ed-a9e0-31467b283664',
  'authenticated',
  'authenticated',
  '947411396@sumayni.pe',
  extensions.crypt('123456', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Juan López","phone":"947411396"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '844c76b1-bf8f-40ee-b5a0-4cae771889c4',
  'authenticated',
  'authenticated',
  '971825787@sumayni.pe',
  extensions.crypt('123456', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Gadiel Zúñiga","phone":"971825787"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '98e3b806-7a3f-4fd9-89d6-8476504fe800',
  'authenticated',
  'authenticated',
  '935860401@sumayni.pe',
  extensions.crypt('123456', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Brandon Mauricio","phone":"935860401"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653',
  'authenticated',
  'authenticated',
  '907530293@sumayni.pe',
  extensions.crypt('123456', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Mauro Lázaro","phone":"907530293"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'e75da8d4-4505-4087-bd7d-9c637e6fa608',
  'authenticated',
  'authenticated',
  '947646767@sumayni.pe',
  extensions.crypt('123456', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Ronaldinho Villanueva","phone":"947646767"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 3. Perfiles en Urb. Bellamar (Nuevo Chimbote)
INSERT INTO public.profiles (id, full_name, phone, home_address, home_location, role, is_vulnerable) VALUES
(
  '01258287-49a3-49ed-a9e0-31467b283664',
  'Juan López',
  '947411396',
  'Calle 23 Mz. Ñ - Lt. 9, Urbanización Bellamar',
  ST_GeogFromText('SRID=4326;POINT(-78.51696742469132 -9.114307544880225)'),
  'dirigente',
  FALSE
),
(
  '844c76b1-bf8f-40ee-b5a0-4cae771889c4',
  'Gadiel Zúñiga',
  '971825787',
  'Calle 22 Mz. M - Lt. 4, Urbanización Bellamar',
  ST_GeogFromText('SRID=4326;POINT(-78.51632 -9.11372)'),
  'vecino',
  FALSE
),
(
  '98e3b806-7a3f-4fd9-89d6-8476504fe800',
  'Brandon Mauricio',
  '935860401',
  'Av. Pacífico Mz. K - Lt. 12, Urbanización Bellamar',
  ST_GeogFromText('SRID=4326;POINT(-78.51758 -9.11492)'),
  'vecino',
  FALSE
),
(
  '1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653',
  'Mauro Lázaro',
  '907530293',
  'Calle 24 Mz. O - Lt. 6, Urbanización Bellamar',
  ST_GeogFromText('SRID=4326;POINT(-78.51618 -9.11542)'),
  'vecino',
  TRUE
),
(
  'e75da8d4-4505-4087-bd7d-9c637e6fa608',
  'Ronaldinho Villanueva',
  '947646767',
  'Jr. Los Cipreses Mz. L - Lt. 3, Urbanización Bellamar',
  ST_GeogFromText('SRID=4326;POINT(-78.51768 -9.11332)'),
  'vecino',
  FALSE
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  home_address = EXCLUDED.home_address,
  home_location = EXCLUDED.home_location,
  role = EXCLUDED.role,
  is_vulnerable = EXCLUDED.is_vulnerable;

-- 4. Junta Vecinal Urb. Bellamar (liderada por Juan López)
INSERT INTO public.neighborhood_groups (id, name, sector_name, leader_id, boundary) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Junta Vecinal Urb. Bellamar',
  'Urb. Bellamar',
  '01258287-49a3-49ed-a9e0-31467b283664',
  ST_GeogFromText('SRID=4326;POLYGON((-78.5220 -9.1190, -78.5120 -9.1190, -78.5120 -9.1095, -78.5220 -9.1095, -78.5220 -9.1190))')
);

UPDATE public.profiles
SET group_id = '11111111-1111-4111-8111-111111111111'
WHERE id IN (
  '01258287-49a3-49ed-a9e0-31467b283664',
  '98e3b806-7a3f-4fd9-89d6-8476504fe800',
  '1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653'
);

-- 5. Solicitud pendiente de Ronaldinho Villanueva
INSERT INTO public.group_join_requests (group_id, user_id, full_name, address, status, is_emergency, is_from_whatsapp)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'e75da8d4-4505-4087-bd7d-9c637e6fa608',
  'Ronaldinho Villanueva',
  'Jr. Los Cipreses Mz. L - Lt. 3, Urbanización Bellamar',
  'PENDING',
  FALSE,
  FALSE
);

-- 6. Directorio Público (Servicios, Productos y Auxilio)
INSERT INTO public.services (id, provider_id, title, category, listing_type, description) VALUES
('22222222-2222-4222-8222-222222222201', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'Gasfitería y reparación de fugas', 'Gasfitería', 'SERVICIO', 'Detección de fugas, cambio de caños, llaves de paso y desatoros en Urb. Bellamar.'),
('22222222-2222-4222-8222-222222222202', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'Instalaciones eléctricas domiciliarias', 'Electricidad', 'SERVICIO', 'Tableros térmicos, tomacorrientes, luminarias LED y revisión de cortocircuitos.'),
('22222222-2222-4222-8222-222222222203', '844c76b1-bf8f-40ee-b5a0-4cae771889c4', 'Cerrajería vecinal 24 horas', 'Cerrajería', 'SERVICIO', 'Apertura de puertas, cambio de chapas y duplicado de llaves a precio justo.'),
('22222222-2222-4222-8222-222222222204', 'e75da8d4-4505-4087-bd7d-9c637e6fa608', 'Refuerzo escolar y matemáticas', 'Clases', 'SERVICIO', 'Clases personalizadas de matemática y física para primaria y secundaria.'),
('22222222-2222-4222-8222-222222222205', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'Kit de caños, teflón y repuestos PVC', 'Gasfitería', 'PRODUCTO', 'Repuestos básicos de ferretería y gasfitería disponibles al instante en el barrio.'),
('22222222-2222-4222-8222-222222222206', 'e75da8d4-4505-4087-bd7d-9c637e6fa608', 'Muebles pequeños y repisas de madera', 'Carpintería', 'PRODUCTO', 'Repisas, banquitos y organizadores hechos a pedido con madera pino.'),
('22222222-2222-4222-8222-222222222207', '844c76b1-bf8f-40ee-b5a0-4cae771889c4', 'Botiquín vecinal y toma de presión', 'Cuidado', 'AUXILIO', 'Apoyo rápido con tensiómetro, oxímetro y primeros auxilios básicos en la cuadra.'),
('22222222-2222-4222-8222-222222222208', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'Acompañamiento a citas médicas locales', 'Cuidado', 'AUXILIO', 'Red de apoyo y acompañamiento para vecinos mayores que necesiten ir al centro de salud.'),
('22222222-2222-4222-8222-222222222209', 'e75da8d4-4505-4087-bd7d-9c637e6fa608', 'Botiquín vecinal de emergencia y curaciones', 'Cuidado', 'AUXILIO', 'Gasas estériles, alcohol, termómetro y vendas disponibles ante cualquier golpe o urgencia en la manzana.');

-- 7. Reseñas y favoritos de Juan López
INSERT INTO public.reviews (service_id, client_id, rating, comment) VALUES
('22222222-2222-4222-8222-222222222201', '01258287-49a3-49ed-a9e0-31467b283664', 5, 'Muy rápido y limpio el trabajo de gasfitería.'),
('22222222-2222-4222-8222-222222222201', '844c76b1-bf8f-40ee-b5a0-4cae771889c4', 5, 'Excelente vecino, precio justo.'),
('22222222-2222-4222-8222-222222222203', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 5, 'Me ayudó tarde en la noche con la chapa.'),
('22222222-2222-4222-8222-222222222204', '1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653', 5, 'Muy paciente enseñando a mi nieto.');

INSERT INTO public.user_favorites (user_id, service_id) VALUES
('01258287-49a3-49ed-a9e0-31467b283664', '22222222-2222-4222-8222-222222222201'),
('01258287-49a3-49ed-a9e0-31467b283664', '22222222-2222-4222-8222-222222222205'),
('01258287-49a3-49ed-a9e0-31467b283664', '22222222-2222-4222-8222-222222222207');

-- 8. Muro Solidario (Capa Privada Urb. Bellamar)
INSERT INTO public.solidary_posts (id, group_id, author_id, post_type, category, description, urgency, status, is_ai_voice) VALUES
('33333333-3333-4333-8333-333333333301', '11111111-1111-4111-8111-111111111111', '1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653', 'AYUDA', 'Adulto Mayor', 'Necesito apoyo para subir dos bidones de agua y bolsas del mercado el sábado en la mañana.', 'ALTA_CRITICA', 'OPEN', FALSE),
('33333333-3333-4333-8333-333333333302', '11111111-1111-4111-8111-111111111111', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'PRESTAMO', 'Herramientas', 'Presto escalera telescópica de 4 metros y taladro percutor a vecinos verificados de Bellamar.', 'BAJA', 'OPEN', FALSE),
('33333333-3333-4333-8333-333333333303', '11111111-1111-4111-8111-111111111111', '844c76b1-bf8f-40ee-b5a0-4cae771889c4', 'DONACION', 'Alimentos', 'Donación de víveres no perecibles y frazadas para familias que lo necesiten esta semana.', 'MEDIA', 'OPEN', FALSE),
('33333333-3333-4333-8333-333333333304', '11111111-1111-4111-8111-111111111111', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'VOLUNTARIADO', 'Cuidado', 'Disponible los domingos por la tarde para acompañar o hacer trámites de adultos mayores.', 'BAJA', 'OPEN', FALSE);

INSERT INTO public.solidary_comments (post_id, author_id, content) VALUES
('33333333-3333-4333-8333-333333333301', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'Don Mauro, yo paso a las 9:00 a. m. a ayudarle con los bidones.'),
('33333333-3333-4333-8333-333333333301', '01258287-49a3-49ed-a9e0-31467b283664', 'Gracias Brandon, coordinado desde la junta vecinal.');

INSERT INTO public.volunteers (post_id, user_id) VALUES
('33333333-3333-4333-8333-333333333301', '98e3b806-7a3f-4fd9-89d6-8476504fe800');

-- 9. Red de Cuidado, Noticias y Chats
INSERT INTO public.care_assignments (vulnerable_profile_id, buddy_profile_id, status, notes) VALUES
('1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653', '98e3b806-7a3f-4fd9-89d6-8476504fe800', 'SEGUIMIENTO_REQUERIDO', 'Adulto mayor en Calle 24. Requiere apoyo semanal con compras pesadas y control de presión.');

INSERT INTO public.neighborhood_news (sector_name, title, content, source) VALUES
('Urb. Bellamar', 'Mantenimiento de red de agua', 'Jueves de 8:00 a. m. a 2:00 p. m. en las manzanas K a O. Junta agua con anticipación.', 'SERVICIOS_PUBLICOS'),
('Urb. Bellamar', 'Faena de limpieza en parque central', 'Sábado 9:00 a. m. frente a Calle 23. Traer escobas, guantes y bolsas.', 'DIRIGENCIA'),
('Urb. Bellamar', 'Campaña gratuita de vacunación', 'Domingo de 9:00 a. m. a 1:00 p. m. en la losa deportiva de Bellamar.', 'MUNICIPAL');

INSERT INTO public.chat_conversations (id, service_id, client_id, provider_id) VALUES
('44444444-4444-4444-8444-444444444401', '22222222-2222-4222-8222-222222222201', '01258287-49a3-49ed-a9e0-31467b283664', '98e3b806-7a3f-4fd9-89d6-8476504fe800'),
('44444444-4444-4444-8444-444444444402', '22222222-2222-4222-8222-222222222203', '01258287-49a3-49ed-a9e0-31467b283664', '844c76b1-bf8f-40ee-b5a0-4cae771889c4');

INSERT INTO public.chat_messages (conversation_id, sender_id, content) VALUES
('44444444-4444-4444-8444-444444444401', '01258287-49a3-49ed-a9e0-31467b283664', 'Hola Brandon, tengo una fuga en el caño de la cocina. ¿Puedes pasar hoy?'),
('44444444-4444-4444-8444-444444444401', '98e3b806-7a3f-4fd9-89d6-8476504fe800', '¡Claro vecino! Estoy a una cuadra, paso a las 5:00 p. m. a revisarlo.'),
('44444444-4444-4444-8444-444444444402', '01258287-49a3-49ed-a9e0-31467b283664', 'Buenas Gadiel, ¿haces duplicado de llaves de puerta principal?'),
('44444444-4444-4444-8444-444444444402', '844c76b1-bf8f-40ee-b5a0-4cae771889c4', 'Sí Juan, cuando gustes me avisas y coordinamos.');
