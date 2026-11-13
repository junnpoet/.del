-- WhatsApp onboarding confirmation state, nearest-member community lookup, and join request coordinates

ALTER TABLE group_join_requests
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS whatsapp_onboarding_states (
  whatsapp_phone TEXT PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES neighborhood_groups(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  sector_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  contact_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE whatsapp_onboarding_states ENABLE ROW LEVEL SECURITY;

-- Encuentra la comunidad del miembro más cercano a la ubicación compartida por WhatsApp
CREATE OR REPLACE FUNCTION get_nearest_member_community(
  user_lat FLOAT,
  user_lng FLOAT
)
RETURNS TABLE (
  group_id UUID,
  group_name TEXT,
  sector_name TEXT,
  nearest_member_address TEXT,
  distance_meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id AS group_id,
    g.name AS group_name,
    g.sector_name,
    p.home_address AS nearest_member_address,
    ROUND(ST_Distance(
      p.home_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    )::numeric, 0)::FLOAT AS distance_meters
  FROM profiles p
  JOIN neighborhood_groups g ON g.id = p.group_id
  WHERE p.group_id IS NOT NULL
    AND p.home_location IS NOT NULL
  ORDER BY ST_Distance(
    p.home_location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
  ) ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Centroide de respaldo para solicitudes sin coordenadas explícitas
CREATE OR REPLACE FUNCTION get_group_center(p_group_id UUID)
RETURNS TABLE (
  lat FLOAT,
  lng FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ST_Y(ST_Centroid(g.boundary::geometry))::FLOAT AS lat,
    ST_X(ST_Centroid(g.boundary::geometry))::FLOAT AS lng
  FROM neighborhood_groups g
  WHERE g.id = p_group_id
    AND g.boundary IS NOT NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
