# SPEC-04: Capa Privada, Muro Solidario y Red de Cuidados

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Mauricio** (Frontend Features) |
| **Módulo** | Muro de Economía Solidaria, Red de Acompañamiento y Modo Accesible Adaptativo |
| **Dependencias Entrantes** | Requiere UI Base de Juan ([SPEC-01](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-01-FRONTEND-CORE.md)) y Políticas RLS de Mauro ([SPEC-02](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-02-BACKEND-POSTGIS.md)) |
| **Stack Técnico** | React Native, NativeWind v4, Expo Haptics, TanStack Query |

---

## 1. Objetivo

Implementar la **Capa Privada** de **Sumayni**: el espacio de economía solidaria no monetaria (préstamos, donaciones y voluntariado), la gestión protegida de la **Red de Acompañamiento a personas vulnerables (Padrinos Vecinales)** y la interfaz del **Modo Accesible Adaptativo** diseñada específicamente para adultos mayores.

---

## 2. Pantallas y Componentes a Desarrollar

### 2.1. Muro Solidario Unificado (`features/community/screens/SolidaryFeedScreen.tsx`)
* **Barra de Chips de Filtrado Rápido:**
  * `[ Todos ]`
  * `[ Préstamo de Herramientas ]` (escaleras, taladros, podadoras)
  * `[ Donaciones ]` (ropa, medicinas selladas, materiales)
  * `[ Trueque / Habilidades ]` (tiempo, clases, reparaciones)
  * `[ Voluntariado Comunitario ]` (ollas comunes, faenas barriales)
* **Tarjeta de Publicación Solidaria (`SolidaryPostCard.tsx`):**
  * Título, autor y tipo de intercambio (sin dinero).
  * Distintivo visual si proviene de WhatsApp: `[ 📱 Solicitud vía WhatsApp ]`.
  * Botón de acción adaptado:
    * Si es usuario de la app: **`[ Ofrecer Ayuda ]`**.
    * Si viene de WhatsApp: **`[ 🟢 Responder por WhatsApp ]`** (dispara enlace `wa.me`).

### 2.2. Selector de Doble Visualización (`[ Muro | Mapa Barrial ]`)
* Permite al vecino conmutar entre la lista cronológica y el mapa del sector, donde se representan los puntos donde se ofrecen préstamos de herramientas o se requieren donaciones.

### 2.3. Capa Protegida de la Red de Acompañamiento (`features/community/screens/CareNetworkMap.tsx`)
* **Restricción de Acceso:** Solo se renderiza si el usuario es `dirigente` o tiene asignado un rol de `padrino` en Supabase.
* **Marcadores de Estado en Mapa:**
  * 🟢 **Al día:** Vecino vulnerable contactado en los últimos 7 días.
  * 🟡 **Seguimiento requerido:** Requiere visita programada o compra de medicinas.
  * 🔴 **Alerta Activa:** Vecino activó el botón de auxilio SOS.
* Permite al padrino actualizar el estado con un toque (*"Registrar visita realizada"*).

### 2.4. Modo Accesible Adaptativo para Adultos Mayores (`features/accessible-mode/screens/AccessibleHomeScreen.tsx`)
Para aquellos vecinos mayores o personas con discapacidad que utilizan la aplicación:
* **Activación:** Switch en el perfil o pre-activación durante el onboarding.
* **Transformación Visual Radical:**
  * Se ocultan menús densos, feeds extensos y configuraciones.
  * Tipografía escalada de alto contraste con fondo suave.
  * **Botón Central SOS Gigante:**
    * Ocupa el 50% de la pantalla.
    * Requiere **mantener presionado durante 2 segundos**.
    * Activa vibración continua con `expo-haptics` para evitar toques accidentales.
    * Al dispararse, inserta un registro en `sos_alerts` con su geolocalización y notifica mediante Supabase Realtime a los padrinos vecinales y dirigentes de su manzana.
  * **Botón de Micrófono Asistente:**
    * Permite pulsar y decir su necesidad en voz alta (*"Necesito que me compren pan"*, *"Me duele el pecho"*).

### 2.5. Panel de Gestión del Dirigente Barrial (`features/community/screens/LeaderDashboardScreen.tsx`)
* **Acceso Condicional:** Visible exclusivamente en el perfil de usuarios con `role === 'dirigente'`.
* **Módulos del Panel:**
  1. **Solicitudes de Unión Pendientes:** Lista las solicitudes de `group_join_requests` con distintivos visuales (`[ 🚨 Emergencia ]` o `[ 📱 WhatsApp ]`), permitiendo **Aprobar en 1 tap** (invoca RPC `approve_join_request`) o Rechazar.
  2. **Bandeja de Denuncias Comunitarias:** Visualiza los reportes de `service_reports` para mediar o sancionar malas prácticas.
  3. **Gestión de Padrinazgo:** Interfaz para asignar vecinos enlace a perfiles vulnerables en `care_assignments`.
  4. **Publicador de Noticias Zonales:** Formulario ágil para emitir avisos oficiales a `neighborhood_news`.

### 2.6. Soporte Multilingüe (Español / Quechua) (`src/i18n/`)
* Archivo de traducciones básicas en Quechua para etiquetas críticas:
  * Auxilio / Ayuda $\rightarrow$ *Yanapay*
  * Red de vecinos $\rightarrow$ *Ayllu*
  * Hogar $\rightarrow$ *Wasi*
  * Buen vivir $\rightarrow$ *Allin Kawsay*

---

## 3. Criterios de Aceptación (Checklist de Mauricio)

- [ ] Muro solidario filtra publicaciones en tiempo real por cada chip sin recargar.
- [ ] Tarjetas con origen WhatsApp muestran botón directo para abrir `wa.me`.
- [ ] Capa de mapa de personas vulnerables solo es visible para perfiles autorizados (dirigente/padrino).
- [ ] Modo Accesible Adaptativo transforma la pantalla en una vista limpia con el Botón SOS central de 2 segundos.
- [ ] Vibración háptica configurada y funcionando en la confirmación del botón SOS con registro en `sos_alerts`.
- [ ] Panel del Dirigente funcional: aprueba solicitudes de unión (app y WhatsApp) y revisa denuncias.
