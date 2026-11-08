-- =====================================================================
-- SPEC-02 · §4.1 Políticas RLS para las operaciones de la app
-- Completa las operaciones que la §4 dejaba bloqueadas o abiertas.
-- Usa las mismas funciones de la spec: is_dirigente() e is_padrino_of().
-- =====================================================================
SET search_path = public, extensions;

-- ---------------------------------------------------------------------
-- 1. Perfiles: registro y actualización del propio perfil
-- ---------------------------------------------------------------------
-- Al registrarse, el usuario crea SOLO su fila, como 'vecino' y sin grupo
-- (el grupo se asigna con approve_join_request; el rol lo asigna un admin).
CREATE POLICY "Usuario crea su propio perfil" ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id AND role = 'vecino' AND group_id IS NULL);

CREATE POLICY "Usuario actualiza su propio perfil" ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Desde la app solo se pueden editar estas columnas: nadie puede cambiarse
-- el rol (auto-promoverse a dirigente) ni meterse solo a un grupo.
REVOKE UPDATE ON profiles FROM anon, authenticated;
GRANT UPDATE (full_name, phone, home_address, home_location, is_vulnerable, push_token)
  ON profiles TO authenticated;

-- ---------------------------------------------------------------------
-- 2. Visto Bueno Vecinal (reviews)
-- ---------------------------------------------------------------------
CREATE POLICY "Lectura de reseñas" ON reviews FOR SELECT TO authenticated USING (true);

-- Solo reseña el cliente que chateó con el prestador y recibió su
-- "Solicitar Visto Bueno" (mensaje con is_review_request = true). SPEC-03 §2.3.
CREATE POLICY "Cliente otorga Visto Bueno tras la solicitud" ON reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = client_id
  AND EXISTS (
    SELECT 1
    FROM chat_conversations c
    JOIN chat_messages m ON m.conversation_id = c.id
    WHERE c.service_id = reviews.service_id
      AND c.client_id = auth.uid()
      AND m.sender_id = c.provider_id
      AND m.is_review_request = TRUE
  )
);

-- ---------------------------------------------------------------------
-- 3. Red de Cuidado Vecinal (care_assignments)
-- ---------------------------------------------------------------------
CREATE POLICY "Padrino y dirigentes ven asignaciones" ON care_assignments FOR SELECT TO authenticated
USING (buddy_profile_id = auth.uid() OR is_dirigente(auth.uid()));

CREATE POLICY "Dirigentes asignan padrinos" ON care_assignments FOR INSERT TO authenticated
WITH CHECK (is_dirigente(auth.uid()));

-- El padrino registra visitas y cambia el semáforo; el dirigente también.
CREATE POLICY "Padrino y dirigentes actualizan estado" ON care_assignments FOR UPDATE TO authenticated
USING (buddy_profile_id = auth.uid() OR is_dirigente(auth.uid()))
WITH CHECK (buddy_profile_id = auth.uid() OR is_dirigente(auth.uid()));

CREATE POLICY "Dirigentes quitan asignaciones" ON care_assignments FOR DELETE TO authenticated
USING (is_dirigente(auth.uid()));

-- ---------------------------------------------------------------------
-- 4. Noticias zonales: publica el dirigente
-- ---------------------------------------------------------------------
CREATE POLICY "Dirigentes publican noticias" ON neighborhood_news FOR INSERT TO authenticated
WITH CHECK (is_dirigente(auth.uid()));

-- ---------------------------------------------------------------------
-- 5. Emergencias: el dirigente la cierra (status = 'RESOLVED')
-- ---------------------------------------------------------------------
CREATE POLICY "Dirigentes actualizan emergencias" ON emergency_events FOR UPDATE TO authenticated
USING (is_dirigente(auth.uid())) WITH CHECK (is_dirigente(auth.uid()));

-- ---------------------------------------------------------------------
-- 6. Tablas que la §4 dejaba sin RLS
-- ---------------------------------------------------------------------
ALTER TABLE neighborhood_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

-- Grupos: visibles para recomendar y unirse; se crean desde el panel de Supabase.
CREATE POLICY "Lectura de grupos vecinales" ON neighborhood_groups FOR SELECT TO authenticated
USING (true);

-- SOS: lo envía la propia persona; lo ven y atienden ella, sus padrinos y los dirigentes.
CREATE POLICY "Vecino envía su SOS" ON sos_alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "SOS visible para remitente, padrinos y dirigentes" ON sos_alerts FOR SELECT TO authenticated
USING (
  auth.uid() = sender_id
  OR is_padrino_of(auth.uid(), sender_id)
  OR is_dirigente(auth.uid())
);

CREATE POLICY "Remitente, padrinos y dirigentes actualizan el SOS" ON sos_alerts FOR UPDATE TO authenticated
USING (
  auth.uid() = sender_id
  OR is_padrino_of(auth.uid(), sender_id)
  OR is_dirigente(auth.uid())
)
WITH CHECK (
  auth.uid() = sender_id
  OR is_padrino_of(auth.uid(), sender_id)
  OR is_dirigente(auth.uid())
);
