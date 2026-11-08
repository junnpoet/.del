-- SPEC-02 · §4 Políticas de Seguridad RLS Blindadas (Sin Recursión)
-- Copiado de docs/specs/SPEC-02-BACKEND-POSTGIS.md.
SET search_path = public, extensions;

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
