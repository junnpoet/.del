-- Tabla para confirmar publicaciones sugeridas por el bot de WhatsApp antes de insertarlas en solidary_posts
CREATE TABLE IF NOT EXISTS whatsapp_pending_posts (
  whatsapp_phone TEXT PRIMARY KEY,
  group_id UUID REFERENCES neighborhood_groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  contact_name TEXT,
  post_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL,
  is_ai_voice BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE whatsapp_pending_posts ENABLE ROW LEVEL SECURITY;
