-- Add avatar_url to profiles and expose provider_avatar_url in get_nearby_services
SET search_path = public, extensions;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DROP FUNCTION IF EXISTS get_nearby_services(FLOAT, FLOAT, INT);

CREATE OR REPLACE FUNCTION get_nearby_services(
  user_home_lat FLOAT,
  user_home_lng FLOAT,
  radius_meters INT
)
RETURNS TABLE (
  service_id UUID,
  provider_id UUID,
  provider_name TEXT,
  provider_avatar_url TEXT,
  title TEXT,
  category TEXT,
  description TEXT,
  listing_type TEXT,
  rating_avg NUMERIC,
  reviews_total INT,
  distance_meters FLOAT,
  provider_lat FLOAT,
  provider_lng FLOAT
) AS $$
DECLARE
  v_group_id UUID;
  v_home GEOGRAPHY;
BEGIN
  v_home := ST_SetSRID(ST_MakePoint(user_home_lng, user_home_lat), 4326)::geography;

  SELECT p.group_id
    INTO v_group_id
  FROM public.profiles p
  WHERE p.id = auth.uid();

  RETURN QUERY
  SELECT
    s.id,
    u.id,
    u.full_name,
    u.avatar_url,
    s.title,
    s.category,
    s.description,
    s.listing_type,
    s.rating_average,
    s.reviews_count,
    ROUND(ST_Distance(u.home_location, v_home)::numeric, 0)::FLOAT AS distance_meters,
    ST_Y(u.home_location::geometry)::FLOAT AS provider_lat,
    ST_X(u.home_location::geometry)::FLOAT AS provider_lng
  FROM public.services s
  JOIN public.profiles u ON s.provider_id = u.id
  WHERE ST_DWithin(u.home_location, v_home, radius_meters)
     OR (
       v_group_id IS NOT NULL
       AND EXISTS (
         SELECT 1
         FROM public.profiles m
         WHERE m.group_id = v_group_id
           AND m.home_location IS NOT NULL
           AND ST_DWithin(u.home_location, m.home_location, radius_meters)
       )
     )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

GRANT EXECUTE ON FUNCTION get_nearby_services(FLOAT, FLOAT, INT) TO authenticated, anon;
