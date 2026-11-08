# Supabase Edge Functions — Sumayni

Este directorio contiene las Serverless Edge Functions (Deno) para la integración de mensajería, inteligencia artificial y contingencia comunitaria ([SPEC-05](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-05-EMERGENCIA-IA.md)).

## Funciones Disponibles

1. **`whatsapp-webhook`**
   - **GET**: Verificación de handshake con Meta WhatsApp Cloud API (`hub.mode`, `hub.verify_token`, `hub.challenge`).
   - **POST**:
     - **Onboarding de no registrados (Ubicación GPS)**: Registra solicitud en `group_join_requests` y asocia el sector más cercano.
     - **Publicación Solidaria por Voz (Audio)**: Descarga nota de voz de Meta Graph API, la procesa con **Gemini 2.0 Flash** y genera el registro en `solidary_posts`.
     - **Consultas de Oficios Vecinales (Texto)**: Busca servicios por palabra clave y retorna fichas formateadas con enlace directo `wa.me`.
   - **Difusión Masiva**: `broadcastEmergencyAlert` para despacho masivo en caso de activación de emergencia.

2. **`process-voice-post`**
   - Endpoint JSON directo para la app móvil: recibe `{ audioBase64, mimeType }` y devuelve la ficha estructurada procesada por Gemini Flash (`{ tipo, categoria, urgencia, resumen }`).

## Variables de Entorno Requeridas

Configurar en Supabase CLI o Dashboard (`supabase secrets set ...`):

| Variable | Descripción |
| :--- | :--- |
| `SUPABASE_URL` | URL del proyecto Supabase (inyectada automáticamente por el runtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave Service Role para bypass de RLS en operaciones administrativas |
| `META_VERIFY_TOKEN` | Token de verificación configurado en el panel de desarrolladores de Meta |
| `META_ACCESS_TOKEN` | Token permanente de acceso a la API Cloud de WhatsApp |
| `META_PHONE_NUMBER_ID` | Identificador del número de teléfono remitente en WhatsApp Cloud |
| `GEMINI_API_KEY` | Llave de API de Google Gemini para procesamiento con `gemini-2.0-flash` |
