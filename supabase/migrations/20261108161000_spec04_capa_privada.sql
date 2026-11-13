-- =====================================================================
-- SPEC-04 · Capa Privada (Mauricio): ajustes de backend que necesita la app.
-- Coordinar con Mauro (SPEC-02) antes de aplicarla en el proyecto Supabase.
-- =====================================================================
SET search_path = public, extensions;

-- 1. Realtime para la Red de Cuidado: el SOS de un adulto mayor debe llegar
--    al instante a sus padrinos y a la dirigencia (SPEC-04 §2.4), y el
--    semáforo 🟢/🟡/🔴 debe actualizarse sin recargar (SPEC-04 §2.3).
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.sos_alerts,
  public.care_assignments;

-- 2. Bandeja de denuncias: la §4 solo deja LEER los reportes al dirigente.
--    Para "revisar" una denuncia necesita poder cambiar su estado.
CREATE POLICY "Dirigentes actualizan reportes" ON service_reports FOR UPDATE TO authenticated
USING (is_dirigente(auth.uid()))
WITH CHECK (is_dirigente(auth.uid()));
