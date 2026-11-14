<p align="center">
  <img src="./assets/images/logo-with-text.png" alt="Sumayni" width="280" />
</p>

<h1 align="center">Sumayni</h1>

<p align="center">
  <strong>Plataforma comunitaria barrial de reciprocidad, oficios de confianza y resiliencia ante emergencias.</strong>
</p>

---

## ¿Qué resuelve?

Sumayni crea comunidad entre vecinos de una misma urbanización, sector, barrio, o cualquier tipo de denominación vecinal que se te ocurra. Con el objetivo de resolver necesidades cotidianas, así como emergencias reales.

Buscamos hacerlo simple, amigable, rápido, enfocado en quienes han confiado, para no ser subestimados, para realmente construir una comunidad unida y con un prpósito común de bienestar.

| Módulo | Capacidades clave |
| :--- | :--- |
| **Directorio Público y Chat** | Búsqueda geolocalizada (PostGIS) de servicios, productos o medidas de ayuda vecinal, chat 1 a 1 en tiempo real, tarjeta de **Visto Bueno Vecinal** (calificación 1–5 estrellas) y reportes comunitarios. |
| **Muro Solidario** | Publicaciones vecinales (`AYUDA`, `PRESTAMO`, `DONACION`, `TRUEQUE`, `VOLUNTARIADO`), coordinación por comentarios en vivo, publicación por **nota de voz con IA** y panel del dirigente para aprobar ingresos y noticias zonales. |
| **Modo Simplificado y SOS** | Interfaz accesible para personas vulnerables con botón central **SOS** (pulsación sostenida de 2 s con vibración), envío inmediato de ubicación a `sos_alerts` y modal de emergencia en vivo para **dirigentes y padrinos**. |
| **Bot de WhatsApp** | Onboarding por ubicación evaluando la comunidad del miembro más cercano, confirmación previa al dirigente, alta automática como miembro con bienvenida, búsqueda inteligente con IA por texto o audio, consulta de publicaciones propias y publicación asistida por voz. |
| **Bilingüe** | Soporte integrado en **Español** y **Runasimi (Quechua)** desde cualquier pantalla. |

---

## Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **App Móvil** | Expo (`~58`), React Native (`0.88`), Expo Router, NativeWind / Tailwind CSS, TanStack Query + persistencia offline (`AsyncStorage`) |
| **Backend & Datos** | Supabase (PostgreSQL + PostGIS, Auth, RLS, Realtime, Storage) |
| **Edge Functions** | Deno (`whatsapp-webhook`, `approve-join-request`, `process-voice-post`, `send-whatsapp-otp`, `send-push-alert`) |
| **IA (Voz e Intención)** | Groq (`whisper-large-v3-turbo`, `qwen3-32b` / `llama-3.3-70b-versatile`) con respaldo Gemini Flash |
| **Mensajería WhatsApp** | Evolution API v2 (webhook `MESSAGES_UPSERT` + descarga de audios y envío de texto) |

---

## Inicio Rápido

### 1. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las credenciales de tu proyecto Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

### 2. Instalar y ejecutar la app

```bash
npm install
npm start
```

También puedes abrir directamente en Android o Web:

```bash
npm run android
npm run web
```

### 3. Base de datos y Edge Functions (Supabase)

Si deseas desplegar las migraciones y funciones en tu propio proyecto Supabase:

```bash
npx supabase db push --remote
npx supabase functions deploy whatsapp-webhook --no-verify-jwt
npx supabase functions deploy send-whatsapp-otp --no-verify-jwt
npx supabase functions deploy approve-join-request
npx supabase functions deploy process-voice-post
npx supabase functions deploy send-push-alert
```

Secretos requeridos en Supabase (`npx supabase secrets set`):
- `GROQ_API_KEY` (y opcionalmente `GEMINI_API_KEY`)
- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`

---

## Estructura del Proyecto

```text
sumayni/
├── app/                         # Rutas de Expo Router (tabs, auth, onboarding, chat, modo accesible)
├── assets/images/               # Íconos, splash y logo (logo-with-text.png)
├── src/
│   ├── components/              # Componentes UI reutilizables
│   ├── features/
│   │   ├── accessible-mode/     # Vista simplificada para vulnerables y botón SOS de 2s
│   │   ├── community/           # Muro Solidario, Red de Cuidado y Panel del Dirigente
│   │   ├── emergency/           # Banner de emergencia, modal SOS para dirigentes/padrinos y Realtime
│   │   ├── profile/             # Perfil y mis publicaciones
│   │   └── public/              # Directorio de oficios, mapa, reseñas y chat 1 a 1
│   ├── i18n/                    # Diccionario Español / Runasimi (Quechua) y selector de idioma
│   └── services/                # Cliente Supabase, Auth/OTP, caché Query y utilidades geo
└── supabase/
    ├── functions/               # Edge Functions (WhatsApp bot, aprobación, voz IA, OTP, push)
    ├── migrations/              # Esquema SQL, PostGIS, RLS, triggers y RPCs
    └── seed.sql                 # Datos iniciales de demostración
```
