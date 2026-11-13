-- Detects an active emergency for the user's community or any community
-- whose composite member influence zone covers the user's home location.
SET search_path = public, extensions;

DROP FUNCTION IF EXISTS get_active_zone_emergency(FLOAT, FLOAT, INT);

CREATE OR REPLACE FUNCTION get_active_zone_emergency(
  user_home_lat FLOAT,
  user_home_lng FLOAT,
  radius_meters INT DEFAULT 500
)
RETURNS TABLE (
  id UUID,
  group_id UUID,
  group_name TEXT,
  event_type TEXT,
  description TEXT,
  activated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_group_id UUID;
  v_home GEOGRAPHY;
BEGIN
  SELECT p.group_id INTO v_group_id
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF user_home_lat IS NOT NULL AND user_home_lng IS NOT NULL THEN
    v_home := ST_SetSRID(ST_MakePoint(user_home_lng, user_home_lat), 4326)::geography;
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.group_id,
    g.name AS group_name,
    e.event_type,
    e.description,
    e.activated_at
  FROM public.emergency_events e
  JOIN public.neighborhood_groups g ON g.id = e.group_id
  WHERE e.status = 'ACTIVE'
    AND (
      (v_group_id IS NOT NULL AND e.group_id = v_group_id)
      OR (
        v_home IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.profiles m
          WHERE m.group_id = e.group_id
            AND m.home_location IS NOT NULL
            AND ST_DWithin(v_home, m.home_location, radius_meters)
        )
      )
    )
  ORDER BY e.activated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

GRANT EXECUTE ON FUNCTION get_active_zone_emergency(FLOAT, FLOAT, INT) TO authenticated;
