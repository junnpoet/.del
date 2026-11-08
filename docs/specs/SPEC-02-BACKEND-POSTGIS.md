# SPEC-02: Backend, Esquema PostGIS & Supabase Realtime

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Mauro** (Backend & Cloud Architect) |
| **Módulo** | Persistencia, Geolocalización por Geocercas, Canales Realtime y Seguridad RLS |
| **Dependencias Salientes** | Entrega el contrato de tipos TypeScript (`src/types/database.ts`) a Gadiel, Mauricio y Ronald |
| **Stack Técnico** | Supabase, PostgreSQL 15+, Extensión PostGIS, Supabase Realtime, Edge Functions (Deno) |

---

## 1. Objetivo

Implementar la base de datos relacional y geoespacial en Supabase, habilitando la búsqueda eficiente de oficios por cercanía caminable desde el hogar registrado, la privacidad estricta de personas vulnerables mediante Row Level Security (RLS) y la difusión en tiempo real de eventos de emergencia.

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
  home_location GEOGRAPHY(Point, 4326) NOT NULL, -- Lat/Lng del hogar
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

-- 4. Directorio de oficios independientes (Capa Pública)
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

-- 5. Calificaciones de "Visto Bueno Vecinal"
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_review_per_client UNIQUE(service_id, client_id)
);

-- 6. Muro Solidario (Intercambios sin dinero)
CREATE TABLE solidary_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id),
  group_id UUID REFERENCES neighborhood_groups(id),
  post_type TEXT NOT NULL CHECK (post_type IN ('PRESTAMO', 'DONACION', 'TRUEQUE', 'VOLUNTARIADO', 'AYUDA')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'MEDIA' CHECK (urgency IN ('BAJA', 'MEDIA', 'ALTA_CRITICA')),
  is_from_whatsapp BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Eventos de Emergencia (Gobernanza)
CREATE TABLE emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES neighborhood_groups(id),
  event_type TEXT NOT NULL, -- SISMO, HUAICO, INCENDIO, CORTE_SERVICIOS
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED')),
  activated_by UUID NOT NULL REFERENCES profiles(id),
  description TEXT,
  activated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Red de Cuidado Vecinal (Padrinazgo)
CREATE TABLE care_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vulnerable_profile_id UUID NOT NULL REFERENCES profiles(id),
  buddy_profile_id UUID NOT NULL REFERENCES profiles(id),
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

* **Protección de Población Vulnerable:** La ubicación exacta de perfiles con `is_vulnerable = TRUE` solo puede ser leída si el usuario autenticado tiene el rol `dirigente` o está asignado como su padrino en `care_assignments`.
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de prestadores" 
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
```

---

## 5. Canales de Supabase Realtime

Mauro configurará la publicación de eventos en tiempo real para las tablas:
1. `emergency_events`: Eventos `INSERT` y `UPDATE` para mutación inmediata de la UI móvil.
2. `solidary_posts`: Eventos `INSERT` para nuevos pedidos en el muro comunitario.

---

## 6. Criterios de Aceptación (Checklist de Mauro)

- [ ] Script SQL ejecutado y tablas creadas en Supabase con índices espaciales (`GIST(home_location)`).
- [ ] Función RPC `get_nearby_services` probada y retornando distancias precisas en metros.
- [ ] Políticas RLS activadas y verificadas para impedir filtración de ubicaciones de personas vulnerables.
- [ ] Publicación Realtime activada para `emergency_events` y `solidary_posts`.
- [ ] Archivo `src/types/database.ts` generado y entregado al equipo con las interfaces de TypeScript.
