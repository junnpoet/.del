-- SPEC-02 · §5 Canales de Supabase Realtime
-- Publica en Realtime las 4 tablas que lista la spec.
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.emergency_events,     -- INSERT y UPDATE: mutación inmediata de la UI móvil
  public.solidary_posts,       -- INSERT: nuevos pedidos en el muro comunitario
  public.group_join_requests,  -- INSERT con is_emergency = true: admisiones express
  public.chat_messages;        -- INSERT: chat en vivo y tarjeta de Visto Bueno en 1 tap
