-- SPEC-02 · §2 Esquema de Base de Datos y Tablas Principales (14 tablas)
-- Copiado de docs/specs/SPEC-02-BACKEND-POSTGIS.md.
-- PostGIS vive en "extensions": se agrega al search_path para encontrar geography.
SET search_path = public, extensions;

-- 2. Perfiles de usuario (con residencia fija)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  home_address TEXT NOT NULL,
  home_location GEOGRAPHY(Point, 4326) NOT NULL, -- Lat/Lng del hogar registrado
  role TEXT DEFAULT 'vecino' CHECK (role IN ('vecino', 'dirigente', 'padrino')),
  is_vulnerable BOOLEAN DEFAULT FALSE,
  push_token TEXT, -- Token Expo para notificaciones push críticas
  group_id UUID, -- Relación opcional con grupo barrial privado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Grupos vecinales privados (Juntas barriales)
CREATE TABLE neighborhood_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector_name TEXT NOT NULL,
  leader_id UUID REFERENCES profiles(id),
  boundary GEOGRAPHY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enlace de llave foránea para evitar dependencia circular
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_group
FOREIGN KEY (group_id) REFERENCES neighborhood_groups(id) ON DELETE SET NULL;

-- 4. Solicitudes de unión a grupos vecinales (Soporta App móvil y WhatsApp)
CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES neighborhood_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL si proviene de WhatsApp
  whatsapp_phone TEXT,                                    -- Teléfono si el registro es por WhatsApp
  full_name TEXT,                                         -- Nombre capturado por el Bot de WhatsApp
  address TEXT,                                           -- Dirección capturada por el Bot
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  is_emergency BOOLEAN DEFAULT FALSE,                     -- Flag de unión express por contingencia
  is_from_whatsapp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Directorio de oficios independientes (Capa Pública)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- Gasfitería, Electricidad, Cerrajería, etc.
  description TEXT NOT NULL,
  rating_average NUMERIC(3, 2) DEFAULT 0.0,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Calificaciones de "Visto Bueno Vecinal" (Cierre de servicio en 1 tap)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_review_per_client UNIQUE(service_id, client_id)
);

-- 7. Favoritos guardados por el usuario
CREATE TABLE user_favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, service_id)
);

-- 8. Reportes y denuncias de servicios (Moderación comunitaria)
CREATE TABLE service_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('COBRO_ABUSIVO', 'INCUMPLIMIENTO', 'PERFIL_FALSO', 'FALTA_RESPETO', 'OTRO')),
  details TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tablón de Noticias Zonales públicas
CREATE TABLE neighborhood_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'MUNICIPAL' CHECK (source IN ('MUNICIPAL', 'SERVICIOS_PUBLICOS', 'DIRIGENCIA')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Muro Solidario (Soporta publicaciones desde App y por notas de voz de WhatsApp)
CREATE TABLE solidary_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL si viene de WhatsApp
  group_id UUID REFERENCES neighborhood_groups(id),
  whatsapp_sender_phone TEXT,                               -- Teléfono si el autor usó WhatsApp
  whatsapp_sender_name TEXT,                                -- Nombre si el autor usó WhatsApp
  post_type TEXT NOT NULL CHECK (post_type IN ('PRESTAMO', 'DONACION', 'TRUEQUE', 'VOLUNTARIADO', 'AYUDA')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'MEDIA' CHECK (urgency IN ('BAJA', 'MEDIA', 'ALTA_CRITICA')),
  is_from_whatsapp BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Eventos de Emergencia (Gobernanza)
CREATE TABLE emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES neighborhood_groups(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- SISMO, HUAICO, INCENDIO, CORTE_SERVICIOS, INSEGURIDAD
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED')),
  activated_by UUID NOT NULL REFERENCES profiles(id),
  description TEXT,
  activated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Red de Cuidado Vecinal (Padrinazgo de personas vulnerables)
CREATE TABLE care_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vulnerable_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buddy_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'AL_DIA' CHECK (status IN ('AL_DIA', 'SEGUIMIENTO_REQUERIDO', 'ALERTA_ACTIVA')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Conversaciones y Mensajes de Chat (Cliente - Prestador con Visto Bueno en 1 tap)
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_service_client_conv UNIQUE(service_id, client_id)
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_review_request BOOLEAN DEFAULT FALSE, -- Dispara la tarjeta de Visto Bueno en 1 tap en la UI del cliente
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Alertas SOS individuales de personas vulnerables
CREATE TABLE sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES neighborhood_groups(id) ON DELETE CASCADE,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  audio_url TEXT,
  transcription TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ATTENDED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPEC-02 · §6 Checklist: "tablas creadas en Supabase con índices espaciales (GIST(home_location))"
CREATE INDEX profiles_home_location_gix ON profiles USING GIST (home_location);
