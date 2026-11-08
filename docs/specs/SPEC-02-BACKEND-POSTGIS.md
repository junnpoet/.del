# SPEC-02: Backend, Esquema PostGIS & Supabase Realtime

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Mauro** (Backend & Cloud Architect) |
| **Módulo** | Persistencia, Geolocalización por Geocercas, Canales Realtime y Seguridad RLS |
| **Dependencias Salientes** | Entrega el contrato de tipos TypeScript (`src/types/database.ts`) a Gadiel, Mauricio y Ronald |
| **Stack Técnico** | Supabase, PostgreSQL 15+, Extensión PostGIS, Supabase Realtime, Edge Functions (Deno) |

---

## 1. Objetivo

Implementar la base de datos relacional y geoespacial en Supabase, habilitando la búsqueda eficiente de oficios por cercanía caminable desde el hogar registrado, la privacidad estricta de personas vulnerables mediante Row Level Security (RLS) sin recursión infinita, el soporte para vecinos omnicanal de WhatsApp, el chat de servicio en tiempo real y la difusión instantánea de emergencias.

---

## 2. Esquema de Base de Datos y Tablas Principales

```sql
-- 1. Habilitar extensión geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

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
```

---

## 3. Funciones SQL Auxiliares y Geoespaciales

### 3.1. Funciones de Seguridad para evitar recursión en RLS
```sql
CREATE OR REPLACE FUNCTION is_dirigente(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'dirigente'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_padrino_of(buddy_id UUID, vulnerable_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM care_assignments 
    WHERE buddy_profile_id = buddy_id AND vulnerable_profile_id = vulnerable_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 3.2. Trigger para recalcular el Visto Bueno Vecinal
```sql
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET 
    rating_average = ROUND((SELECT AVG(rating) FROM reviews WHERE service_id = NEW.service_id)::numeric, 2),
    reviews_count = (SELECT COUNT(*) FROM reviews WHERE service_id = NEW.service_id)
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_service_rating();
```

### 3.3. Búsqueda Geoespacial PostGIS desde Residencia Registrada
```sql
CREATE OR REPLACE FUNCTION get_nearby_services(
  user_home_lat FLOAT,
  user_home_lng FLOAT,
  radius_meters INT
)
RETURNS TABLE (
  service_id UUID,
  provider_id UUID,
  provider_name TEXT,
  title TEXT,
  category TEXT,
  rating_avg NUMERIC,
  reviews_total INT,
  distance_meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.provider_id,
    u.full_name,
    s.title,
    s.category,
    s.rating_average,
    s.reviews_count,
    ROUND(ST_Distance(
      u.home_location,
      ST_SetSRID(ST_MakePoint(user_home_lng, user_home_lat), 4326)::geography
    )::numeric, 0)::FLOAT AS distance_meters
  FROM services s
  JOIN profiles u ON s.provider_id = u.id
  WHERE ST_DWithin(
    u.home_location,
    ST_SetSRID(ST_MakePoint(user_home_lng, user_home_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

### 3.4. Búsqueda y Recomendación de Grupos Vecinales por Proximidad y Actividad
```sql
CREATE OR REPLACE FUNCTION get_nearby_groups(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_meters INT
)
RETURNS TABLE (
  group_id UUID,
  name TEXT,
  sector_name TEXT,
  members_count INT,
  distance_meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.sector_name,
    (SELECT COUNT(*)::INT FROM profiles p WHERE p.group_id = g.id) AS members_count,
    ROUND(ST_Distance(
      ST_Centroid(g.boundary::geometry)::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    )::numeric, 0)::FLOAT AS distance_meters
  FROM neighborhood_groups g
  WHERE ST_DWithin(
    ST_Centroid(g.boundary::geometry)::geography,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC, members_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.5. Aprobación de Solicitudes de Ingreso por el Dirigente
```sql
CREATE OR REPLACE FUNCTION approve_join_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  v_req RECORD;
BEGIN
  SELECT * INTO v_req FROM group_join_requests WHERE id = request_id;
  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Solicitud no encontrada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM neighborhood_groups WHERE id = v_req.group_id AND leader_id = auth.uid()) THEN
    RAISE EXCEPTION 'No autorizado: Solo el dirigente del grupo puede aprobar solicitudes';
  END IF;

  UPDATE group_join_requests SET status = 'APPROVED' WHERE id = request_id;

  IF v_req.user_id IS NOT NULL THEN
    UPDATE profiles SET group_id = v_req.group_id WHERE id = v_req.user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
```

---

## 4. Políticas de Seguridad RLS Blindadas (Sin Recursión)

```sql
-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE solidary_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 1. Perfiles (Uso de is_dirigente e is_padrino_of para evitar recursión infinita)
CREATE POLICY "Lectura pública de prestadores y vecinos no vulnerables" 
ON profiles FOR SELECT 
USING (is_vulnerable = FALSE OR auth.uid() = id);

CREATE POLICY "Acceso a personas vulnerables solo para padrinos y dirigentes"
ON profiles FOR SELECT
USING (
  is_vulnerable = TRUE AND (
    is_padrino_of(auth.uid(), id) OR is_dirigente(auth.uid())
  )
);

-- 2. Servicios: Lectura pública autenticada, inserción solo por el prestador
CREATE POLICY "Lectura de servicios para todos" ON services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Prestador gestiona sus servicios" ON services FOR ALL USING (auth.uid() = provider_id);

-- 3. Favoritos: Cada usuario gestiona exclusivamente sus favoritos
CREATE POLICY "Gestión personal de favoritos" ON user_favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Chat y Mensajes: Solo los participantes pueden leer y escribir
CREATE POLICY "Participantes acceden a su conversación" ON chat_conversations FOR ALL USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Participantes envían y ven mensajes" ON chat_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM chat_conversations WHERE id = chat_messages.conversation_id AND (client_id = auth.uid() OR provider_id = auth.uid()))
);

-- 5. Muro Solidario: Lectura y publicación comunitaria
CREATE POLICY "Lectura del muro solidario" ON solidary_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vecinos publican en muro" ON solidary_posts FOR INSERT WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

-- 6. Emergencias: Lectura pública, activación solo por dirigentes
CREATE POLICY "Lectura de emergencias activa" ON emergency_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo dirigentes activan emergencias" ON emergency_events FOR INSERT WITH CHECK (is_dirigente(auth.uid()));

-- 7. Reportes y Solicitudes
CREATE POLICY "Creación de reportes" ON service_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Dirigentes leen reportes" ON service_reports FOR SELECT USING (is_dirigente(auth.uid()));

CREATE POLICY "Creación de solicitudes de unión" ON group_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Dirigentes gestionan solicitudes" ON group_join_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM neighborhood_groups WHERE id = group_join_requests.group_id AND leader_id = auth.uid())
);

-- 8. Noticias Zonales: Lectura abierta
CREATE POLICY "Lectura de noticias zonales" ON neighborhood_news FOR SELECT TO authenticated USING (true);
```

---

### 4.1. Políticas para las Operaciones de la App

Completa las operaciones que la §4 dejaba bloqueadas (registro, Visto Bueno, padrinos, noticias, cierre de emergencias) y protege `sos_alerts` y `neighborhood_groups`, que estaban sin RLS. Migración: `supabase/migrations/20261108140000_spec02_rls_operaciones.sql`.

```sql
-- 1. Perfiles: el usuario crea solo su fila como 'vecino' y sin grupo; no puede cambiarse el rol
CREATE POLICY "Usuario crea su propio perfil" ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id AND role = 'vecino' AND group_id IS NULL);
CREATE POLICY "Usuario actualiza su propio perfil" ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE UPDATE ON profiles FROM anon, authenticated;
GRANT UPDATE (full_name, phone, home_address, home_location, is_vulnerable, push_token) ON profiles TO authenticated;

-- 2. Visto Bueno: solo el cliente que recibió la solicitud del prestador en el chat
CREATE POLICY "Lectura de reseñas" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cliente otorga Visto Bueno tras la solicitud" ON reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM chat_conversations c JOIN chat_messages m ON m.conversation_id = c.id
    WHERE c.service_id = reviews.service_id AND c.client_id = auth.uid()
      AND m.sender_id = c.provider_id AND m.is_review_request = TRUE
  )
);

-- 3. Red de Cuidado: el padrino ve y actualiza lo suyo; el dirigente gestiona todo
CREATE POLICY "Padrino y dirigentes ven asignaciones" ON care_assignments FOR SELECT TO authenticated
USING (buddy_profile_id = auth.uid() OR is_dirigente(auth.uid()));
CREATE POLICY "Dirigentes asignan padrinos" ON care_assignments FOR INSERT TO authenticated
WITH CHECK (is_dirigente(auth.uid()));
CREATE POLICY "Padrino y dirigentes actualizan estado" ON care_assignments FOR UPDATE TO authenticated
USING (buddy_profile_id = auth.uid() OR is_dirigente(auth.uid()))
WITH CHECK (buddy_profile_id = auth.uid() OR is_dirigente(auth.uid()));
CREATE POLICY "Dirigentes quitan asignaciones" ON care_assignments FOR DELETE TO authenticated
USING (is_dirigente(auth.uid()));

-- 4. Noticias zonales y 5. cierre de emergencias: solo dirigentes
CREATE POLICY "Dirigentes publican noticias" ON neighborhood_news FOR INSERT TO authenticated
WITH CHECK (is_dirigente(auth.uid()));
CREATE POLICY "Dirigentes actualizan emergencias" ON emergency_events FOR UPDATE TO authenticated
USING (is_dirigente(auth.uid())) WITH CHECK (is_dirigente(auth.uid()));

-- 6. RLS en las tablas que estaban abiertas
ALTER TABLE neighborhood_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura de grupos vecinales" ON neighborhood_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vecino envía su SOS" ON sos_alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "SOS visible para remitente, padrinos y dirigentes" ON sos_alerts FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR is_padrino_of(auth.uid(), sender_id) OR is_dirigente(auth.uid()));
CREATE POLICY "Remitente, padrinos y dirigentes actualizan el SOS" ON sos_alerts FOR UPDATE TO authenticated
USING (auth.uid() = sender_id OR is_padrino_of(auth.uid(), sender_id) OR is_dirigente(auth.uid()))
WITH CHECK (auth.uid() = sender_id OR is_padrino_of(auth.uid(), sender_id) OR is_dirigente(auth.uid()));
```

---

## 5. Canales de Supabase Realtime

Mauro configurará la publicación de eventos en tiempo real para:
1. `emergency_events`: Eventos `INSERT` y `UPDATE` para mutación inmediata de la UI móvil.
2. `solidary_posts`: Eventos `INSERT` para nuevos pedidos en el muro comunitario.
3. `group_join_requests`: Eventos `INSERT` con `is_emergency = true` para alertar inmediatamente al dirigente de admisiones express.
4. `chat_messages`: Eventos `INSERT` para sincronización de mensajes en vivo y renderizado de la tarjeta de Visto Bueno en 1 tap.

---

## 6. Criterios de Aceptación (Checklist de Mauro)

- [x] Script SQL ejecutado y tablas creadas en Supabase con índices espaciales (`GIST(home_location)`).
- [x] Integridad referencial resuelta sin dependencias circulares.
- [x] Soporte para usuarios omnicanal de WhatsApp en `group_join_requests` y `solidary_posts`.
- [x] Tablas de chat `chat_conversations` y `chat_messages` listas con Realtime activado.
- [x] Funciones `is_dirigente()` e `is_padrino_of()` probadas, erradicando cualquier riesgo de recursión en RLS.
- [x] Trigger de actualización de rating promedio probado tras insertar una reseña.
- [x] Políticas de §4.1 probadas: registro, Visto Bueno, padrinos, noticias, cierre de emergencias y SOS protegido.
- [x] Archivo `src/types/database.ts` generado y entregado al equipo con las interfaces de TypeScript.
