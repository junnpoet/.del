# Matriz de Asignaciones y Plan de Trabajo del Equipo: Sumayni

## 1. Distribución de Roles y Ownership

El equipo está compuesto por 5 desarrolladores trabajando en paralelo durante el sprint de 48 horas. Cada miembro es **Owner** de un módulo y especificación técnica:

| Desarrollador | Rol / Módulo Principal | Especificación Técnica |
| :--- | :--- | :--- |
| **Juan** | Lead Frontend, Branding, Design System & Embudo de Publicación | [SPEC-01: Frontend Core](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-01-FRONTEND-CORE.md) |
| **Mauro** | Backend, PostGIS, Realtime & Seguridad RLS | [SPEC-02: Backend & PostGIS](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-02-BACKEND-POSTGIS.md) |
| **Gadiel** | Capa Pública, Directorio de Proximidad, Chat & Visto Bueno | [SPEC-03: Capa Pública](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-03-CAPA-PUBLICA.md) |
| **Mauricio** | Capa Privada, Muro Solidario, Red de Padrinos & Accesibilidad | [SPEC-04: Capa Privada](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-04-CAPA-PRIVADA.md) |
| **Ronald** | Gobernanza de Emergencia, WhatsApp Cloud API & IA Gemini | [SPEC-05: Emergencia & IA](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-05-EMERGENCIA-IA.md) |

---

## 2. Descripción de Responsabilidades por Desarrollador

### 👤 Juan — Lead Frontend, Branding & Arquitectura UI
* **Misión:** Garantizar que la app respete la filosofía humana, accesible y minimalista acordada, proporcionando la base sobre la que programarán los demás.
* **Entregables:**
  1. Inicialización de Expo SDK + TypeScript + NativeWind v4 + Expo Router.
  2. Implementación de Tokens de Diseño para **Sumayni** (colores cálidos neutros vs. contraste de emergencia, tipografía legible y tamaños de toque $\ge 48$dp).
  3. Biblioteca de Componentes Base: `Button`, `Card`, `Chip`, `Header`, `Modal`, `Input`.
  4. Estructura de navegación principal (tabs y stacks de dos capas).
  5. Onboarding interactivo de 3 pantallas en menos de 45 segundos.
  6. Configuración transversal de TanStack Query v5 con `createAsyncStoragePersister` para soporte offline.
  7. **Embudo Flotante de los 3 Clics (`FloatingActionButton`):** Componente global para publicar en $\le 3$ toques con selector de categoría y captura de nota de voz (`expo-av`).
  8. Flujo de registro obligatorio con dirección y geocodificación fija de residencia (`expo-location`).
  9. Captura y registro del `push_token` del dispositivo con `expo-notifications`.

### 👤 Mauro — Backend, PostGIS & Realtime Architect
* **Misión:** Proveer el backend, modelos de datos, cálculos geoespaciales y canales de sincronización en tiempo real.
* **Entregables:**
  1. Configuración del proyecto Supabase con extensión PostGIS habilitada.
  2. Scripts SQL de creación de las 14 tablas completas (incluyendo chat, favoritos, denuncias, noticias y `sos_alerts`).
  3. Funciones de seguridad `is_dirigente()` e `is_padrino_of()` con `SECURITY DEFINER` para blindar RLS sin recursión.
  4. Funciones SQL geoespaciales: `get_nearby_services` (servicios por radio del hogar) y `get_nearby_groups` (grupos recomendados por proximidad y actividad).
  5. Procedimiento RPC `approve_join_request` para que los dirigentes aprueben solicitudes de unión (app y WhatsApp).
  6. Trigger automático `update_service_rating` para recalcular estrellas y cantidad de reseñas al recibir Visto Bueno.
  7. Canales de WebSockets en tiempo real (`emergency_events`, `solidary_posts`, `chat_messages` y `group_join_requests`).

### 👤 Gadiel — Frontend Features: Capa Pública y Economía Local
* **Misión:** Desarrollar la vitrina de oficios independientes, la geolocalización y el sistema de reputación barrial.
* **Entregables:**
  1. Pantalla de Directorio de Oficios con listado y mapa (`react-native-maps`).
  2. Selector interactivo de radio caminable (*300m, 500m, 1km*) calculado siempre desde el domicilio registrado.
  3. Funcionalidad de marcadores y guardado en **Favoritos** (sincronizado con Supabase).
  4. Pantalla de Chat individual cliente-prestador en tiempo real (`chat_conversations` y `chat_messages`).
  5. Componente de **Visto Bueno Vecinal en 1 tap** (disparado con `is_review_request = true`).
  6. Modal de **Reporte / Denuncia comunitaria** conectado a `service_reports`.
  7. Tablón de Noticias Zonales públicas (`neighborhood_news`).

### 👤 Mauricio — Frontend Features: Capa Privada, Solidaridad & Red de Cuidados
* **Misión:** Construir la vida comunitaria, el apoyo no monetario, la gestión del dirigente y la accesibilidad para poblaciones vulnerables.
* **Entregables:**
  1. Pantalla de Muro Solidario con filtros por chips: `[Herramientas]`, `[Donación]`, `[Trueque]`, `[Voluntariado]`.
  2. Selector de doble visualización interactiva: **`[ Muro Feed | Mapa Barrial ]`**.
  3. Módulo de **Red de Acompañamiento a Personas Vulnerables:** Capa protegida en mapa (solo visible para Dirigentes y Padrinos) con estados 🟢/🟡/🔴.
  4. **Modo Accesible Adaptativo:** Interfaz simplificada para adultos mayores (texto gigante, eliminación de ruido, botón SOS de 2s con registro en `sos_alerts` y vibración háptica).
  5. **Panel de Gestión del Dirigente Barrial (`LeaderDashboardScreen.tsx`):** Aprobación de solicitudes de ingreso en 1 tap (app y WhatsApp), revisión de denuncias vecinales y asignación de padrinos.
  6. Selector multilingüe (Español / Quechua).

### 👤 Ronald — Integración: Emergencia, WhatsApp Bridge & IA Multimodal
* **Misión:** Implementar la resiliencia en crisis, el puente de inclusión con WhatsApp, el despacho de push y el pipeline de voz con IA.
* **Entregables:**
  1. Componente de control **"Slide to Activate"** para activación de emergencia con cuenta regresiva de 5 segundos.
  2. Lógica de mutación instantánea de la aplicación hacia el **Tablero de Ayuda Humanitaria**.
  3. Detección de crisis por consenso (umbral de 3 reportes simultáneos).
  4. Banner de emergencia en Capa Pública con botón de **Incorporación Express**.
  5. Supabase Edge Function para el webhook de **WhatsApp Cloud API** (onboarding conversacional, consultas y notas de voz).
  6. **Servicio de Notificaciones Push Móviles (Expo Push API):** Despacho masivo ante emergencias y alertas prioritarias para padrinos ante SOS.
  7. Integración con **Google Gemini Flash** (@google/genai) para transcribir y estructurar notas de voz en fichas JSON automáticas en $\le 3$ toques.

---

## 3. Matriz de Dependencias y Fases de Integración

```
[ Horas 00 - 10 ]
  Juan: Base Expo + Tokens Sumayni ──────┐
  Mauro: Supabase DB + PostGIS ───────────┴──> Contrato de Tipos (src/types/)
                                                      │
[ Horas 10 - 24 ]                                     ▼
  Gadiel: Capa Pública (Directorio + Visto Bueno) ◄───┤
  Mauricio: Capa Privada (Muro + Padrinos) ───────────┤
  Ronald: Edge Function WhatsApp + Gemini ────────────┘
                                                      │
[ Horas 24 - 36 ]                                     ▼
  Integración de Realtime & Mutación a Modo Emergencia
  (Ronald + Mauricio + Juan)
                                                      │
[ Horas 36 - 44 ]                                     ▼
  Pruebas Offline (TanStack Outbox Persister) + WhatsApp Bridge
                                                      │
[ Horas 44 - 48 ]                                     ▼
  Congelamiento de código, Demo en vivo & Pitch Deck
```

---

## 4. Convenciones de Equipo para el Código

* **Estructura de Directorios:**
  ```
  src/
  ├── components/       # Componentes atómicos accesibles (Juan)
  ├── features/
  │   ├── auth/         # Login y registro de hogar
  │   ├── public/       # Directorio, favoritos, visto bueno (Gadiel)
  │   ├── community/    # Muro solidario, mapa padrinos (Mauricio)
  │   └── emergency/    # Tablero humanitario, slide-to-activate (Ronald)
  ├── services/         # Supabase client, queries y mutaciones
  ├── types/            # Interfaces TypeScript compartidas (Mauro + Juan)
  └── theme/            # Tokens NativeWind de Sumayni (Juan)
  ```
* **Ramas Git:**
  * `main`: Producción estable para demo.
  * `feature/spec-01-core`: Juan
  * `feature/spec-02-db`: Mauro
  * `feature/spec-03-public`: Gadiel
  * `feature/spec-04-private`: Mauricio
  * `feature/spec-05-emergency-ia`: Ronald
* **Commits:** Formato convencional (`feat:`, `fix:`, `refactor:`, `chore:`), sin autoría de IA ni trailers automáticos.
