# SPEC-02: Backend, Esquema PostGIS & Supabase Realtime

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Mauro** (Backend & Cloud Architect) |
| **Módulo** | Persistencia, Geolocalización por Geocercas, Canales Realtime y Seguridad RLS |
| **Dependencias Salientes** | Entrega el contrato de tipos TypeScript (`src/types/database.ts`) a Gadiel, Mauricio y Ronald |
| **Stack Técnico** | Supabase, PostgreSQL 15+, Extensión PostGIS, Supabase Realtime, Edge Functions (Deno) |

---

## 1. Objetivo

Implementar la base de datos relacional y geoespacial en Supabase, habilitando la búsqueda eficiente de oficios por cercanía caminable desde el hogar registrado, la privacidad estricta de personas vulnerables mediante Row Level Security (RLS), la gestión de reportes/favoritos/noticias y la difusión en tiempo real de eventos de emergencia.

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

-- 4. Solicitudes de unión a grupos vecinales (Normal y Unión Express en Emergencia)
CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES neighborhood_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  is_emergency BOOLEAN DEFAULT FALSE, -- Flag de unión express por contingencia
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Directorio de oficios independientes (Capa Pública)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- Gasfitería, Electricidad, Cerrajería, etc.
  description TEXT NOT NULL,
  rating_average NUMERIC(3, 2) DEFAULT 5.0,
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

-- 10. Muro Solidario (Intercambios sin dinero)
CREATE TABLE solidary_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES neighborhood_groups(id),
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
```

---

## 3. Función Geoespacial PostGIS: Consulta por Proximidad

Para garantizar que el cálculo se haga respecto a la **residencia fija del usuario**:

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
```

---

## 4. Políticas de Seguridad RLS (Row Level Security)

```sql
-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_news ENABLE ROW LEVEL SECURITY;

-- 1. Perfiles
CREATE POLICY "Lectura pública de prestadores y vecinos no vulnerables" 
ON profiles FOR SELECT 
USING (is_vulnerable = FALSE OR auth.uid() = id);

CREATE POLICY "Acceso a personas vulnerables solo para padrinos y dirigentes"
ON profiles FOR SELECT
USING (
  is_vulnerable = TRUE AND (
    EXISTS (SELECT 1 FROM care_assignments WHERE buddy_profile_id = auth.uid() AND vulnerable_profile_id = profiles.id)
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'dirigente'
  )
);

-- 2. Favoritos: Cada usuario gestiona exclusivamente sus favoritos
CREATE POLICY "Gestión personal de favoritos"
ON user_favorites FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Reportes: Vecinos crean reportes, solo dirigentes pueden revisarlos
CREATE POLICY "Creación de reportes"
ON service_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Lectura de reportes para dirigentes"
ON service_reports FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'dirigente');

-- 4. Solicitudes de Grupo: Usuario crea petición, dirigentes gestionan
CREATE POLICY "Creación de solicitudes de ingreso"
ON group_join_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dirigentes ven solicitudes de su grupo"
ON group_join_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM neighborhood_groups 
    WHERE id = group_join_requests.group_id AND leader_id = auth.uid()
  )
);

-- 5. Noticias Zonales: Lectura abierta para todo usuario autenticado
CREATE POLICY "Lectura libre de noticias zonales"
ON neighborhood_news FOR SELECT
TO authenticated
USING (true);
```

---

## 5. Canales de Supabase Realtime

Mauro configurará la publicación de eventos en tiempo real para las tablas:
1. `emergency_events`: Eventos `INSERT` y `UPDATE` para mutación inmediata de la UI móvil.
2. `solidary_posts`: Eventos `INSERT` para nuevos pedidos en el muro comunitario.
3. `group_join_requests`: Eventos `INSERT` con `is_emergency = true` para alertar inmediatamente al dirigente de admisiones express.

---

## 6. Criterios de Aceptación (Checklist de Mauro)

- [ ] Script SQL ejecutado y tablas creadas en Supabase con índices espaciales (`GIST(home_location)`).
- [ ] Integridad referencial resuelta con `ALTER TABLE` sin dependencias circulares.
- [ ] Tablas de soporte creadas: `group_join_requests`, `service_reports`, `user_favorites` y `neighborhood_news`.
- [ ] Función RPC `get_nearby_services` probada y retornando distancias precisas en metros.
- [ ] Políticas RLS activadas y verificadas para impedir filtración de ubicaciones de personas vulnerables y proteger reportes.
- [ ] Publicación Realtime activada para `emergency_events`, `solidary_posts` y `group_join_requests`.
- [ ] Archivo `src/types/database.ts` generado y entregado al equipo con las interfaces de TypeScript.
