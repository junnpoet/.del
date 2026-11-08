-- Publica los cambios que afectan al directorio en vivo.
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.services,
  public.reviews,
  public.user_favorites;
