-- SPEC-02 · §3 Funciones SQL Auxiliares y Geoespaciales
-- Copiado de docs/specs/SPEC-02-BACKEND-POSTGIS.md (§3.1 a §3.5).
SET search_path = public, extensions;

-- 3.1. Funciones de Seguridad para evitar recursión en RLS
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

-- 3.2. Trigger para recalcular el Visto Bueno Vecinal
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

-- 3.3. Búsqueda Geoespacial PostGIS desde Residencia Registrada
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

-- 3.4. Búsqueda y Recomendación de Grupos Vecinales por Proximidad y Actividad
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

-- 3.5. Aprobación de Solicitudes de Ingreso por el Dirigente
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
