# SPEC-04: Capa Privada, Muro Solidario, Dinámica Comunitaria y Red de Cuidados

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Mauricio** (Frontend Features) |
| **Módulo** | Muro de Economía Solidaria, Hilos de Acción Comunitaria, Red de Acompañamiento y Modo Accesible Adaptativo |
| **Dependencias Entrantes** | Requiere UI Base de Juan ([SPEC-01](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-01-FRONTEND-CORE.md)) y Políticas RLS / Esquema de Mauro ([SPEC-02](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/specs/SPEC-02-BACKEND-POSTGIS.md)) |
| **Stack Técnico** | React Native, NativeWind v4, Expo Haptics, TanStack Query |

---

## 1. Objetivo

Implementar la **Capa Privada** de **Sumayni**: transformar el espacio cerrado de la junta vecinal en una comunidad viva y participativa donde los vecinos interactúan, coordinan y difunden iniciativas de ayuda mutua sin dinero. 

El módulo abarca el **Muro Solidario Dinámico** (con ciclo de vida de pedidos, hilos de coordinación barrial y difusión), **Convocatorias de Acción Colectiva** (faenas y ollas comunes con contadores de adhesión), **Micro-voluntariado de Acompañamiento** a adultos mayores, la gestión protegida de la **Red de Padrinos Vecinales** y el **Modo Accesible Adaptativo**.

---

## 2. Pantallas y Componentes a Desarrollar

### 2.1. Pizarra Oficial de la Junta Vecinal (`NeighborhoodNewsModal.tsx`)
* Acceso directo mediante un botón en la esquina superior derecha del encabezado con indicador de avisos no leídos (ej. badge numerado).
* Despliega una vista limpia con comunicados oficiales fijados por la dirigencia barrial: cortes programados de agua/luz (Sedapal, Enel), asambleas zonales o faenas de fin de semana.
* Evita ocupar espacio vertical permanente en el feed y permite al vecino consultar avisos pendientes en 1 toque.

### 2.2. Muro Solidario Dinámico (`features/community/screens/SolidaryFeedScreen.tsx`)
* **Barra de Chips de Filtrado Simplificada (Alta Legibilidad):**
  * `[ Todos ]`
  * `[ Préstamos ]` (herramientas, escaleras, equipos)
  * `[ Donaciones ]` (ropa, medicinas selladas, libros)
  * `[ Acción Comunal ]` (faenas barriales, cuidado de adultos mayores, apoyo mutuo)

* **Tarjeta de Publicación Solidaria (`SolidaryPostCard.tsx`):**
  * **Ciclo de Vida Visible del Apoyo:**
    * Estado `[ Abierto / Necesita apoyo ]`
    * Estado `[ En coordinación (X vecinos respondiendo) ]`
    * Estado `[ Resuelto con apoyo del barrio ]`
  * **Metadatos:** Título, autor, manzana/cuadra, tiempo relativo con tipografía mínima de 13sp.
  * **Insignia Omnicanal / IA:**
    * `[ Solicitud vía WhatsApp ]` (si fue capturada por el bot).
    * `[ Voz IA ]` (si fue dictada y procesada con Gemini).
  * **Barra de Interacción Comunitaria:**
    * Botón **`[ Coordinar Apoyo (N) ]`**: Despliega el Bottom Sheet de respuestas (`SolidaryActionSheet.tsx`).
    * Botón **`[ Difundir ]`**: Genera mensaje formateado con deep link para reenviar a grupos de WhatsApp de la manzana.
    * Si la publicación es del usuario autenticado: Botón **`[ Marcar Resuelto ]`** que actualiza el estado a `RESOLVED` y celebra el favor completado.

### 2.3. Hilos de Acción Comunitaria (`SolidaryActionSheet.tsx`)
En lugar de foros caóticos abiertos a quejas o discusiones fuera de foco, las publicaciones cuentan con un **panel inferior desplegable de coordinación orientado a la acción**:
* Lista de respuestas y micro-aportes públicos:
  * *"Vecina, yo tengo 2 baldes para la faena"*
  * *"Don Jacinto, paso por su casa a las 5 pm con el taladro"*
* Botón de respuesta rápida para vecinos autenticados.
* Si el emisor original provino de WhatsApp, cada respuesta cuenta con botón directo **`[ Responder por WhatsApp ]`** (`wa.me`).
* El autor puede pulsar **`[ Aceptar este apoyo ]`**, vinculando al vecino colaborador y cambiando el estado a `IN_PROGRESS`.

### 2.4. Convocatorias de Acción Colectiva y Faenas (`CommunityActionCard.tsx`)
Diseñadas específicamente para el tipo de post `VOLUNTARIADO`:
* **Barra de Meta Comunitaria:** Muestra el progreso de adhesión (*"6 de 10 vecinos confirmados para la faena"*).
* Botón de 1 tap **`[ Me sumo ]`** / **`[ Ya no puedo ir ]`**.
* Lista de avatares/nombres de los vecinos inscritos para generar contagio social y compromiso público.

### 2.5. Micro-voluntariado de Cuidado Vecinal (`CareVolunteerCard.tsx`)
Cumpliendo la Sección 3.1 de la [PROPUESTA.md](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/PROPUESTA.md):
* Solicitudes de acompañamiento no emergentes publicadas abiertamente en el muro con etiqueta `[ Cuidado Vecinal / Yanapay ]`:
  * *"Se necesita acompañar a Don Pedro al policlínico el martes a las 9 am"*.
* Botón **`[ Postular como Acompañante ]`**: Permite a cualquier vecino del sector asumir la tarea sin requerir ser padrino formal, descentralizando el cuidado barrial.

### 2.6. Selector de Doble Visualización (`[ Muro Feed | Mapa Barrial ]`)
* Permite alternar con fluidez entre el feed cronológico y el mapa interactivo del sector con los pines de herramientas, donaciones y puntos de auxilio.

### 2.7. Capa Protegida de la Red de Acompañamiento (`features/community/screens/CareNetworkMap.tsx`)
* **Restricción de Acceso:** Renderizado condicional exclusivo para `role === 'dirigente'` o `role === 'padrino'`.
* **Semáforo Preventivo:**
  * **Verde (Al día):** Adulto mayor contactado o visitado en los últimos 7 días.
  * **Ámbar (Seguimiento requerido):** Requiere visita programada, compra de medicinas o víveres.
  * **Rojo (Alerta Activa):** Botón SOS activado o requerimiento urgente no atendido.
* Registro de visitas en 1 tap (*"Registrar visita realizada"*).

### 2.8. Modo Accesible Adaptativo para Adultos Mayores (`features/accessible-mode/screens/AccessibleHomeScreen.tsx`)
* **Activación:** Selector en perfil u onboarding.
* **Transformación Visual:**
  * Tipografía gigante de alto contraste.
  * Eliminación total de menús, gráficos densos y feeds extensos.
  * **Botón Central SOS Gigante:**
    * Ocupa el 50% de la pantalla.
    * Requiere mantener presionado 2 segundos continuos con vibración táctil (`expo-haptics`).
    * Despacha alerta a `sos_alerts` con geolocalización y notifica a padrinos y dirigentes.
  * **Micrófono Asistente por Voz:**
    * Pulsar y hablar para transcribir necesidades en lenguaje natural.

### 2.9. Panel de Gestión del Dirigente Barrial (`features/community/screens/LeaderDashboardScreen.tsx`)
* **Acceso Condicional:** Visible exclusivamente para usuarios con `role === 'dirigente'`.
* **Módulos:**
  1. **Solicitudes de Unión Pendientes:** Admisión en 1 tap de solicitudes de `group_join_requests` (App móvil y WhatsApp).
  2. **Bandeja de Denuncias:** Moderación de reportes de `service_reports`.
  3. **Gestión de Padrinazgo:** Asignación de vecinos enlace a hogares vulnerables en `care_assignments`.
  4. **Emisor de Noticias Zonales:** Publicación directa hacia `neighborhood_news`.

### 2.10. Soporte Multilingüe (Español / Quechua) (`src/i18n/`)
* Traducciones clave en Quechua para términos de acción comunitaria:
  * Auxilio / Ayuda $\rightarrow$ *Yanapay*
  * Red de vecinos / Comunidad $\rightarrow$ *Ayllu*
  * Trabajo colectivo / Faena $\rightarrow$ *Minka*
  * Hogar $\rightarrow$ *Wasi*
  * Buen vivir $\rightarrow$ *Allin Kawsay*

---

## 3. Criterios de Aceptación (Checklist de Mauricio)

- [ ] Muro solidario filtra por chips en tiempo real (`Préstamos`, `Donaciones`, `Trueque`, `Faenas`, `Cuidado`).
- [ ] Tarjetas solidarias exhiben el ciclo de vida del favor: `Abierto`, `En coordinación` y `Resuelto`.
- [ ] Hilo de Acción Comunitaria (`SolidaryActionSheet.tsx`) permite publicar respuestas de coordinación visibles para todos los vecinos.
- [ ] Botón de difusión rápida genera enlace preformateado para compartir en WhatsApp.
- [ ] Convocatorias de acción colectiva (faenas/ollas) muestran barra de progreso y botón `[ Me sumo ]`.
- [ ] Requerimientos de Cuidado Vecinal permiten que vecinos regulares postulen como voluntarios de acompañamiento.
- [ ] Pizarra de noticias de la junta vecinal se renderiza en la cabecera del muro.
- [ ] Capa de mapa de personas vulnerables protegida por RLS (visible solo para dirigentes y padrinos).
- [ ] Modo Accesible Adaptativo operativo con botón SOS de 2 segundos, vibración háptica y registro en `sos_alerts`.
- [ ] Panel del Dirigente funcional: aprueba ingresos en 1 tap y administra denuncias.
