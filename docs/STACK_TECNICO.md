# Especificación del Stack Tecnológico y Arquitectura de Implementación

## Resumen de la Solución Técnica

> **Objetivo:** Definir la arquitectura de software, herramientas y flujos de datos para construir el prototipo funcional en 48 horas, minimizando la fricción de configuración y maximizando la resiliencia en demostraciones en vivo (online/offline).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TOPOLOGÍA DEL SISTEMA                                │
├──────────────────────────────────────┬─────────────────────────────────────────────────┤
│            CLIENTES                  │                   SERVICIOS CLOUD               │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ [ App Móvil (Expo / React Native) ]  │ [ Supabase Backend ]                            │
│   ├── NativeWind v4 (UI Accesible)   │   ├── PostgreSQL + PostGIS (Geocercas)          │
│   ├── TanStack Query (Outbox Offline)│   ├── Realtime WebSockets (Modo Emergencia)     │
│   └── AsyncStorage Persister         │   ├── Row Level Security (Privacidad Padrinos)  │
│                                      │   └── Edge Functions (Deno / TypeScript)        │
│ [ WhatsApp Client (Vecinos) ]        │                                                 │
│   ├── Canal de Avisos (Broadcast)    │ [ Meta WhatsApp Cloud API ] (Webhooks)          │
│   └── Notas de Voz al Bot            │ [ Google Gemini Flash ] (Audio-to-JSON)         │
└──────────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 1. Matriz de Decisiones Tecnológicas

| Capa | Tecnología Seleccionada | Justificación Arquitectónica (48h Hackathon) |
| :--- | :--- | :--- |
| **Mobile Frontend** | **React Native con Expo SDK (Managed)** | Evita pérdida de tiempo en configuración de Gradle/Pods; hot reload inmediato en teléfonos de prueba. |
| **Enrutamiento** | **Expo Router** | Enrutamiento declarativo basado en archivos con soporte nativo de navegación por pestañas y modales. |
| **Estilos & UI** | **NativeWind v4 (Tailwind CSS)** | Maquetación veloz de componentes accesibles, soporte de modo oscuro/alto contraste y temas visuales neutros. |
| **Mapas** | **`react-native-maps`** | Integración nativa de geolocalización, pines interactivos y radios de proximidad caminables. |
| **Offline-First** | **TanStack Query v5 + AsyncStorage Persister** | Caché automática en disco y mutaciones en cola (`networkMode: 'offlineFirst'`) sin la complejidad de WatermelonDB. |
| **Backend & DB** | **Supabase (PostgreSQL + PostGIS)** | Base de datos relacional con consultas geoespaciales nativas (`ST_DWithin`), autenticación y almacenamiento. |
| **Tiempo Real** | **Supabase Realtime (WebSockets)** | Transmisión sub-segundo para mutar la app al Modo Emergencia y emitir alertas SOS. |
| **Seguridad de Datos** | **PostgreSQL RLS (Row Level Security)** | Control estricto de acceso: la Red de Cuidado Vecinal solo es visible para dirigentes y padrinos asignados. |
| **Motor de IA** | **Google Gemini Flash (Multimodal)** | Ingesta nativa de audio (`.ogg` de WhatsApp / `.m4a` del móvil) a JSON estructurado en un solo paso (< 1.5s). |
| **Canal WhatsApp** | **WhatsApp Cloud API (Meta Graph API)** | Webhook directo en Edge Function sin intermediarios pesados (descartando n8n para evitar puntos de fallo en vivo). |

---

## 2. Detalle de Arquitectura por Capa

### 2.1. Frontend Móvil (React Native + Expo)
* **Estructura Modular (Feature-driven):**
  * `features/auth`: Registro con residencia fija y login individual.
  * `features/public-services`: Directorio de oficios, filtros por radio desde el hogar registrado, favoritos y sistema de Visto Bueno Vecinal en 1 tap.
  * `features/private-community`: Muro Solidario (préstamos, donaciones, voluntariado), capa de Padrinos Vecinales y vista en mapa.
  * `features/emergency`: Gesto *Slide to Activate*, mutación al Tablero de Ayuda Humanitaria y botón SOS central.
  * `features/accessible-mode`: UI adaptativa para adultos mayores con texto gigante y comandos de voz.

### 2.2. Estrategia Offline-First y Resiliencia de Red
Para garantizar que la app siga operando ante la caída de antenas celulares:
1. **Persistencia de Consultas:**
   ```typescript
   // Configuración de persistencia automática
   const persister = createAsyncStoragePersister({
     storage: AsyncStorage,
   });
   ```
   El directorio de emergencias, botiquines y los últimos datos del barrio se leen desde caché si no hay red.
2. **Patrón Outbox para Publicaciones y Reportes SOS:**
   * Las mutaciones se configuran con `networkMode: 'offlineFirst'`.
   * Si no hay conectividad, la acción se guarda localmente en la cola de mutaciones de TanStack Query.
   * Un listener de `NetInfo` detecta la reconexión y dispara la sincronización automática con el backend de Supabase.

### 2.3. Base de Datos y Consultas Geoespaciales (PostGIS)
El cálculo de proximidad no se hace en el cliente para no sobrecargar el móvil; se ejecuta en PostgreSQL con PostGIS:
```sql
-- Ejemplo de búsqueda de oficios dentro del radio del hogar registrado
CREATE OR REPLACE FUNCTION get_nearby_services(
  user_home_lat FLOAT,
  user_home_lng FLOAT,
  radius_meters INT
)
RETURNS TABLE (
  service_id UUID,
  provider_name TEXT,
  category TEXT,
  rating_avg NUMERIC,
  distance_meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    u.full_name,
    s.category,
    s.rating_average,
    ST_Distance(
      u.home_location,
      ST_SetSRID(ST_MakePoint(user_home_lng, user_home_lat), 4326)::geography
    ) AS distance_meters
  FROM services s
  JOIN profiles u ON s.provider_id = u.id
  WHERE ST_DWithin(
    u.home_location,
    ST_SetSRID(ST_MakePoint(user_home_lng, user_home_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. Pipeline de Inteligencia Artificial (Audio a Ficha)

Se descartan arquitecturas obsoletas de 2 pasos (Whisper $\rightarrow$ LLM). Se utiliza la capacidad multimodal directa de **Gemini Flash**:

```
[ Archivo de Audio (.ogg / .m4a) ]
               │
               ▼
   [ Supabase Edge Function ]
               │ (Envío de binario a Gemini API)
               ▼
     [ Gemini Flash Prompt ]
     "Analiza este audio de un vecino. Extrae un JSON con:
      - tipo: 'SOLICITUD_AYUDA' | 'OFERTA_SERVICIO' | 'EMERGENCIA'
      - categoria: string (Gasfitería, Herramientas, Salud, etc.)
      - urgencia: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA'
      - resumen: string (máx 15 palabras)
      - accion_concreta: string"
               │
               ▼
[ Respuesta JSON Estructurada (Schema Enforcement) ]
               │
               ▼
[ Inserción en Tabla `solidary_posts` + Broadcast Realtime ]
```

---

## 4. Pipeline de Integración con WhatsApp

Para evitar servidores intermediarios o túneles frágiles (como n8n local), la integración corre serverless:

```
[ Vecino en WhatsApp ] 
        │ Envía audio o mensaje al bot
        ▼
[ Meta WhatsApp Cloud API ]
        │ Webhook POST a HTTPS público
        ▼
[ Supabase Edge Function: `whatsapp-webhook` ]
        ├── 1. Valida token de verificación de Meta
        ├── 2. Si es comando de texto ("botiquin", "gasfitero"):
        │      Consulta Postgres y responde con tarjeta y enlace wa.me
        └── 3. Si es nota de voz:
               Descarga binario multimedia con token de Meta
               Invoca Gemini Flash API (Audio-to-JSON)
               Inserta publicación en Supabase
               Envía confirmación al vecino por WhatsApp
```

---

## 5. Esquema Preliminar de Base de Datos

```
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│    profiles     │       │     neighborhood_      │       │       services       │
├─────────────────┤       │        groups          │       ├──────────────────────┤
│ id (UUID, PK)   │       ├────────────────────────┤       │ id (UUID, PK)        │
│ full_name       │       │ id (UUID, PK)          │       │ provider_id (FK)     │
│ phone / email   │       │ name                   │       │ category             │
│ home_location   │◄──┐   │ sector_name            │   ┌──►│ description          │
│ is_vulnerable   │   │   │ leader_id (FK)         │   │   │ rating_average       │
│ role (vecino,   │   └───┼─ boundary (polygon)    │   │   │ reviews_count        │
│   dirigente,    │       └────────────────────────┘   │   └──────────────────────┘
│   padrino)      │                   ▲                │
└────────┬────────┘                   │                │   ┌──────────────────────┐
         │                            │                │   │    solidary_posts    │
         │                            │                │   ├──────────────────────┤
         │                ┌───────────┴────────────┐   │   │ id (UUID, PK)        │
         │                │   emergency_events     │   │   │ author_id (FK)       │
         │                ├────────────────────────┤   │   │ group_id (FK)        │
         │                │ id (UUID, PK)          │   │   │ post_type            │
         └───────────────►│ group_id (FK)          │   └───┼─ category            │
                          │ status (NORMAL, ACTIVE)│       │ is_from_whatsapp     │
                          │ event_type (SISMO, ...)│       │ status (OPEN, DONE)  │
                          │ activated_by (FK)      │       └──────────────────────┘
                          └────────────────────────┘
```

---

## 6. Lista de Verificación para el Sprint de 48h

- [ ] **Configuración Inicial (H 0-4):** Repositorio Expo con TypeScript + NativeWind v4 y proyecto Supabase con extensión PostGIS habilitada.
- [ ] **Data Layer (H 4-8):** Script SQL con tablas base, RLS policies y función `get_nearby_services`.
- [ ] **Módulo Público (H 8-16):** Pantalla de directorio por distancia desde residencia, tarjeta de prestador y modal de Visto Bueno en 1 tap.
- [ ] **Módulo Privado y Accesibilidad (H 16-24):** Muro Solidario con chips, vista adaptativa para adultos mayores (botón SOS 2s) y mapa de Padrinos.
- [ ] **Modo Emergencia (H 24-32):** Realtime listener en la app móvil que muta la vista al *Tablero de Ayuda Humanitaria* al activarse el control *Slide to Activate*.
- [ ] **IA y WhatsApp (H 32-40):** Edge function con webhook de Meta y procesamiento de notas de voz con Gemini Flash.
- [ ] **Hardening y Demo (H 40-48):** Validación de modo avión (offline caché), ensayo de flujo omnicanal (WhatsApp $\rightarrow$ App) y pitch.
