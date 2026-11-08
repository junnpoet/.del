-- SPEC-02 · §2.1 Habilitar extensión geoespacial
-- Única diferencia con la spec: se instala en el esquema "extensions",
-- que es donde Supabase espera las extensiones.
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
