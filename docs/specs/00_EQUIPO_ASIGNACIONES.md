# Matriz de Asignaciones y Plan de Trabajo del Equipo: Sumayni

## 1. Distribución de Roles y Ownership

El equipo está compuesto por 5 desarrolladores trabajando en paralelo durante el sprint de 48 horas. Cada miembro es **Owner** de un módulo y especificación técnica:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MAPA DE RESPONSABILIDADES                         │
├──────────────┬───────────────────────────────┬─────────────────────────┤
│ DESARROLLADOR│ ROL / MÓDULO                  │ ESPECIFICACIÓN TÉCNICA  │
├──────────────┼───────────────────────────────┼─────────────────────────┤
│ **Juan**     │ Lead Frontend & Design System │ [SPEC-01](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-01-FRONTEND-CORE.md)    │
│ **Mauro**    │ Backend, PostGIS & Realtime   │ [SPEC-02](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-02-BACKEND-POSTGIS.md)   │
│ **Gadiel**   │ Capa Pública & Directorio     │ [SPEC-03](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-03-CAPA-PUBLICA.md)      │
│ **Mauricio** │ Capa Privada & Accesibilidad  │ [SPEC-04](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-04-CAPA-PRIVADA.md)      │
│ **Ronald**   │ Emergencia, WhatsApp & IA     │ [SPEC-05](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-05-EMERGENCIA-IA.md)     │
└──────────────┴───────────────────────────────┴─────────────────────────┘
```

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

### 👤 Mauro — Backend, PostGIS & Realtime Architect
* **Misión:** Proveer el backend, modelos de datos, cálculos geoespaciales y canales de sincronización en tiempo real.
* **Entregables:**
  1. Configuración del proyecto Supabase con extensión PostGIS habilitada.
  2. Scripts SQL de creación de tablas (`profiles`, `neighborhood_groups`, `services`, `solidary_posts`, `emergency_events`).
  3. Políticas de seguridad RLS (Row Level Security) para proteger datos de personas vulnerables y círculos de confianza.
  4. Funciones SQL optimizadas (`get_nearby_services`) que calculan distancias por radio desde la residencia fija del usuario.
  5. Canales de WebSockets en tiempo real (`emergency_events` y `solidary_posts`) para la mutación instantánea de la UI.

### 👤 Gadiel — Frontend Features: Capa Pública y Economía Local
* **Misión:** Desarrollar la vitrina de oficios independientes, la geolocalización y el sistema de reputación barrial.
* **Entregables:**
  1. Pantalla de Directorio de Oficios con listado y mapa (`react-native-maps`).
  2. Selector interactivo de radio caminable (*300m, 500m, 1km*) calculado siempre desde el domicilio registrado.
  3. Funcionalidad de marcadores y guardado en **Favoritos**.
  4. Pantalla de Chat individual cliente-prestador.
  5. Componente de **Visto Bueno Vecinal en 1 tap** (tarjeta de calificación sin pasarela de pago).
  6. Botón y modal de **Reporte / Denuncia comunitaria**.

### 👤 Mauricio — Frontend Features: Capa Privada, Solidaridad & Red de Cuidados
* **Misión:** Construir la vida comunitaria, el apoyo no monetario y la accesibilidad para poblaciones vulnerables.
* **Entregables:**
  1. Pantalla de Muro Solidario con filtros por chips: `[Herramientas]`, `[Donación]`, `[Trueque]`, `[Voluntariado]`.
  2. Selector de doble visualización interactiva: **`[ Muro Feed | Mapa Barrial ]`**.
  3. Módulo de **Red de Acompañamiento a Personas Vulnerables:** Capa protegida en mapa (solo visible para Dirigentes y Padrinos) con estados 🟢/🟡/🔴.
  4. **Modo Accesible Adaptativo:** Interfaz simplificada para adultos mayores (texto gigante, eliminación de ruido, botón SOS de 2s y comando de voz).
  5. Selector multilingüe (Español / Quechua).

### 👤 Ronald — Integración: Emergencia, WhatsApp Bridge & IA Multimodal
* **Misión:** Implementar la resiliencia en crisis, el puente de inclusión con WhatsApp y el pipeline de voz con IA.
* **Entregables:**
  1. Componente de control **"Slide to Activate"** para activación de emergencia con cuenta regresiva de 5 segundos.
  2. Lógica de mutación instantánea de la aplicación hacia el **Tablero de Ayuda Humanitaria**.
  3. Detección de crisis por consenso (umbral de 3 reportes simultáneos).
  4. Banner de emergencia en Capa Pública con botón de **Incorporación Express**.
  5. Supabase Edge Function para el webhook de **WhatsApp Cloud API** (búsqueda por palabras clave y recepción de notas de voz).
  6. Integración con **Google Gemini Flash** para transcribir y estructurar notas de voz en fichas JSON automáticas en $\le 3$ toques.

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
