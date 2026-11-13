-- =====================================================================
-- SPEC-02 · Oleada 0: Contratos y Base de Datos (Spec-03, Spec-04, Spec-05)
-- Migración idempotente para desbloquear Directory, Muro Solidario y Voz/WhatsApp.
-- =====================================================================
SET search_path = public, extensions;

-- ---------------------------------------------------------------------
-- 1. Tabla solidary_comments (SPEC-04 §2.3 SolidaryActionSheet)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solidary_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES solidary_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  whatsapp_sender_phone TEXT,
  content TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solidary_comments_post_created
  ON solidary_comments (post_id, created_at);

ALTER TABLE solidary_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Miembros del grupo ven comentarios solidarios" ON solidary_comments;
CREATE POLICY "Miembros del grupo ven comentarios solidarios"
  ON solidary_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM solidary_posts sp
      JOIN profiles p ON p.id = auth.uid()
      WHERE sp.id = solidary_comments.post_id
        AND (
          sp.group_id IS NULL
          OR p.group_id = sp.group_id
          OR is_dirigente(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Miembros del grupo comentan en muro solidario" ON solidary_comments;
CREATE POLICY "Miembros del grupo comentan en muro solidario"
  ON solidary_comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1
      FROM solidary_posts sp
      JOIN profiles p ON p.id = auth.uid()
      WHERE sp.id = solidary_comments.post_id
        AND (
          sp.group_id IS NULL
          OR p.group_id = sp.group_id
          OR is_dirigente(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Autor del post o dirigente actualiza comentarios" ON solidary_comments;
CREATE POLICY "Autor del post o dirigente actualiza comentarios"
  ON solidary_comments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM solidary_posts sp
      WHERE sp.id = solidary_comments.post_id
        AND sp.author_id = auth.uid()
    )
    OR is_dirigente(auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM solidary_posts sp
      WHERE sp.id = solidary_comments.post_id
        AND sp.author_id = auth.uid()
    )
    OR is_dirigente(auth.uid())
  );

-- ---------------------------------------------------------------------
-- 2. Tabla volunteers (SPEC-04 §2.4 y §2.5)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES solidary_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_volunteers_post_id
  ON volunteers (post_id);

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Miembros del grupo ven voluntarios" ON volunteers;
CREATE POLICY "Miembros del grupo ven voluntarios"
  ON volunteers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM solidary_posts sp
      JOIN profiles p ON p.id = auth.uid()
      WHERE sp.id = volunteers.post_id
        AND (
          sp.group_id IS NULL
          OR p.group_id = sp.group_id
          OR is_dirigente(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Vecino se suma como voluntario en su grupo" ON volunteers;
CREATE POLICY "Vecino se suma como voluntario en su grupo"
  ON volunteers FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM solidary_posts sp
      JOIN profiles p ON p.id = auth.uid()
      WHERE sp.id = volunteers.post_id
        AND (
          sp.group_id IS NULL
          OR p.group_id = sp.group_id
          OR is_dirigente(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Vecino retira su voluntariado en su grupo" ON volunteers;
CREATE POLICY "Vecino retira su voluntariado en su grupo"
  ON volunteers FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM solidary_posts sp
      JOIN profiles p ON p.id = auth.uid()
      WHERE sp.id = volunteers.post_id
        AND (
          sp.group_id IS NULL
          OR p.group_id = sp.group_id
          OR is_dirigente(auth.uid())
        )
    )
  );

-- ---------------------------------------------------------------------
-- 3. Ajustes en solidary_posts (columnas y RLS UPDATE)
-- ---------------------------------------------------------------------
ALTER TABLE solidary_posts
  ADD COLUMN IF NOT EXISTS target_volunteers INT,
  ADD COLUMN IF NOT EXISTS accepted_helper_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS is_ai_voice BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS "Autor o dirigente actualiza solidary_posts" ON solidary_posts;
CREATE POLICY "Autor o dirigente actualiza solidary_posts"
  ON solidary_posts FOR UPDATE TO authenticated
  USING (
    author_id = auth.uid()
    OR (
      is_dirigente(auth.uid())
      AND (
        group_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM profiles p
          WHERE p.id = auth.uid()
            AND p.group_id = solidary_posts.group_id
        )
      )
    )
  )
  WITH CHECK (
    author_id = auth.uid()
    OR (
      is_dirigente(auth.uid())
      AND (
        group_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM profiles p
          WHERE p.id = auth.uid()
            AND p.group_id = solidary_posts.group_id
        )
      )
    )
  );

-- ---------------------------------------------------------------------
-- 4. Extensión en services + get_nearby_services (pines tricolor y mapa)
-- ---------------------------------------------------------------------
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'SERVICIO';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'services_listing_type_check'
      AND conrelid = 'public.services'::regclass
  ) THEN
    ALTER TABLE services
      ADD CONSTRAINT services_listing_type_check
      CHECK (listing_type IN ('SERVICIO', 'PRODUCTO', 'AUXILIO'));
  END IF;
END $$;

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
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    u.id,
    u.full_name,
    s.title,
    s.category,
    s.description,
    s.listing_type,
    s.rating_average,
    s.reviews_count,
    ROUND(ST_Distance(
      u.home_location,
      ST_SetSRID(ST_MakePoint(user_home_lng, user_home_lat), 4326)::geography
    )::numeric, 0)::FLOAT AS distance_meters,
    ST_Y(u.home_location::geometry)::FLOAT AS provider_lat,
    ST_X(u.home_location::geometry)::FLOAT AS provider_lng
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

-- ---------------------------------------------------------------------
-- 5. Publicación idempotente en supabase_realtime
-- ---------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_events;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.solidary_comments;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteers;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
