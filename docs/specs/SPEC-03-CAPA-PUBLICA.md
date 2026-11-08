# SPEC-03: Capa Pública, Economía Local y Visto Bueno Vecinal

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Gadiel** (Frontend Features) |
| **Módulo** | Directorio de Proximidad, Sistema de Reputación Vecinal y Favoritos |
| **Dependencias Entrantes** | Requiere UI Base de Juan ([SPEC-01](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-01-FRONTEND-CORE.md)) y RPC de Mauro ([SPEC-02](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-02-BACKEND-POSTGIS.md)) |
| **Stack Técnico** | React Native, NativeWind v4, `react-native-maps`, TanStack Query |

---

## 1. Objetivo

Construir la experiencia de usuario de la **Capa Pública** en **Sumayni**: visibilizar los oficios y servicios independientes del barrio en un radio caminable desde el hogar registrado, implementar el guardado en favoritos y habilitar el sistema de reputación barrial mediante el **"Visto Bueno Vecinal" en 1 solo tap**.

---

## 2. Pantallas y Componentes a Desarrollar

### 2.1. Directorio de Oficios y Mapa de Proximidad (`features/public/screens/DirectoryScreen.tsx`)
* **Barra Superior de Filtro:**
  * Selector de radio caminable: `[ 300m ]` | `[ 500m ]` | `[ 1 km ]`.  
    *Regla clave:* La distancia se calcula invocando la RPC `get_nearby_services` pasando las coordenadas de la residencia registrada del usuario.
  * Buscador rápido por categoría (chips: *Gasfitería*, *Electricidad*, *Cerrajería*, *Carpintería*, *Paseador de mascotas*, *Clases*).
* **Toggle de Vista:** Botón accesible para alternar entre **`[ Lista de Tarjetas ]`** y **`[ Mapa Interactivo ]`**.
* **Tarjeta de Prestador (`ServiceCard.tsx`):**
  * Nombre del prestador y oficio.
  * Insignia del **Visto Bueno Vecinal** con promedio de estrellas y número de reseñas de vecinos de la zona.
  * Distancia caminable calculada (ej. *"A 250 metros de tu casa"*).
  * Icono de corazón para **Guardar en Favoritos**.
  * Botón de acción: **`[ Chatear / Consultar ]`**.

### 2.2. Guardado en Favoritos (`features/public/hooks/useFavorites.ts`)
* Permite al usuario marcar con un toque a sus prestadores de confianza.
* Persiste en disco local mediante `AsyncStorage` para consulta instantánea offline y se sincroniza con el perfil de Supabase.

### 2.3. Chat de Servicio y Cierre en 1 Tap (`features/public/screens/ServiceChatScreen.tsx`)
* Conversación limpia y directa entre el vecino y el prestador usando las tablas `chat_conversations` y `chat_messages` con Supabase Realtime.
* **Barra de Acción Superior (Prestador):**  
  * Botón: **`[ Solicitar Visto Bueno Vecinal ]`** (inserta un mensaje en `chat_messages` con flag `is_review_request = true`).
* **Tarjeta de Calificación de 1 Tap (Cliente):**
  * Cuando el cliente recibe un mensaje con `is_review_request = true`, la UI renderiza una tarjeta interactiva destacada dentro del chat:
    > *"¿Juan Quispe completó el arreglo? Confírmalo con tu Visto Bueno Vecinal."*
  * Selector de 1 a 5 estrellas + campo de texto breve opcional.
  * Botón **`[ Otorgar Visto Bueno ]`**.
  * Inserta en la tabla `reviews`, lo que dispara automáticamente el trigger `trg_after_review_insert` en Supabase para recalcular el rating del prestador.

### 2.4. Mecanismo de Reporte / Denuncia (`features/public/components/ReportModal.tsx`)
* Accesible desde el perfil del prestador o desde el menú del chat.
* Opciones claras: *Cobro abusivo*, *No se presentó*, *Perfil falso/Sospechoso*, *Falta de respeto*.
* Envía notificación estructurada al panel de los dirigentes barriales.

### 2.5. Tablón de Noticias Zonales (`features/public/screens/NewsScreen.tsx`)
* Lista de comunicados informativos de la zona (cortes programados de agua/luz, faenas vecinales).

---

## 3. Criterios de Aceptación (Checklist de Gadiel)

- [ ] Directorio carga servicios ordenados por distancia desde el hogar registrado usando la función `get_nearby_services`.
- [ ] Selector de radio (*300m, 500m, 1km*) actualiza el listado y el mapa sin lag.
- [ ] Marcador de favoritos persiste localmente en modo avión.
- [ ] Flujo de "Visto Bueno Vecinal" en 1 tap probado: prestador solicita, cliente recibe tarjeta en chat y reseña queda guardada.
- [ ] Modal de reporte funciona y registra la incidencia en base de datos.
