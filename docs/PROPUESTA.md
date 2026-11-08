# Propuesta Integral de Arquitectura y Solución: Red Vecinal de Proximidad y Solidaridad

## Resumen Ejecutivo

> **Declaración de la Solución:** Plataforma comunitaria hiperlocal y resiliente diseñada para articular la economía barrial cotidiana (oficios y servicios sin desplazamientos mayores) y los intercambios solidarios sin dinero (préstamos, donaciones y voluntariado), con capacidad operativa de **mutar de inmediato a un Tablero de Ayuda Humanitaria** ante emergencias distritales o desastres naturales.
>
> La solución implementa una **arquitectura omnicanal inclusiva**: una aplicación móvil en **React Native** con enfoque *offline-first* para los vecinos digitales, conectada de manera bidireccional con una **Comunidad de WhatsApp** (canal de avisos libre de spam y bot de asistencia con IA) para garantizar que adultos mayores y vecinos no familiarizados con la tecnología participen en igualdad de condiciones.

---

## 1. Filosofía y Principios de Diseño

El producto se rige por un marco de diseño centrado estrictamente en el vecino y en la comunidad barrial:

1. **La aplicación es para la gente, NO para un negocio:**
   * Cero monetización predatoria, sin algoritmos publicitarios ni cobro de comisiones por contacto.
   * El objetivo primario es reducir el costo de vida vecinal y fortalecer la resiliencia comunitaria.
2. **Minimalismo balanceado y accesibilidad sin condescendencia:**
   * Interfaz limpia con paleta de colores neutros y contrastes óptimos.
   * Eliminación de fuentes diminutas, menús laberínticos o wizards interminables.
   * No subestimar al usuario: las acciones críticas deben ser autoexplicativas y resolverse en pocos toques.
3. **Hiperlocalidad como filtro excluyente (Anti-red social masiva):**
   * **El error a evitar:** Agrupar usuarios por métricas de popularidad o crear comunidades gigantescas que diluyen la proximidad.
   * **El principio:** La pertenencia y recomendación se restringen por **geocercas y radios de cercanía física (cuadra, sector, manzana)**. Un servicio o grupo relevante lo es porque está a 300 metros, no porque tenga miles de seguidores en otro distrito.
4. **Autorganización con legitimidad barrial:**
   * La plataforma digitaliza y potencia las estructuras existentes de las juntas vecinales, comités barriales y dirigentes de manzana reconocidos por la comunidad.

---

## 2. Arquitectura de Dos Capas: Pública vs. Privada

Para conciliar la promoción laboral abierta con la privacidad e integridad física de los hogares, la solución divide sus responsabilidades en dos capas claramente delimitadas:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   APLICATIVO VECINAL                                   │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│                CAPA PÚBLICA               │                CAPA PRIVADA                │
│         (Visibilización Comercial)        │          (Comunidad y Solidaridad)         │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Registro individual requerido (perfil,  │ • Acceso restringido por validación        │
│   dirección del hogar y credenciales)     │   del dirigente barrial                    │
│ • Sin necesidad de pertenecer a un grupo  │ • Membresía activa en comunidad vecinal    │
│ • Directorio de oficios independientes    │ • Asignación de co-administradores         │
│ • Radio de búsqueda desde hogar registrado│ • Doble vista: [ Muro Feed | Mapa ]        │
│ • Guardado de servicios en Favoritos      │ • Muro Solidario Unificado con etiquetas   │
│ • Sistema de "Visto Bueno Vecinal"        │ • Capa de Red de Acompañamiento a personas │
│ • Sistema de Reporte / Denuncia comunitaria│   vulnerables (restringida a enlaces)      │
│ • Tablón de Noticias Zonales públicas     │ • Tablero de Ayuda Humanitaria             │
│ • Directorio público de auxilio           │                                            │
│   (botiquines, albergues, serenazgo)      │                                            │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### 2.1. Capa Pública (Visibilización Comercial, Noticias y Recursos Críticos)

* **Registro de Usuario Individual (Sin pertenencia a grupo obligatoria):**
  * Para operar en la capa pública (establecer el radio desde el hogar, guardar favoritos, chatear y emitir el Visto Bueno), el usuario debe registrarse con sus datos esenciales: nombres, apellidos, dirección fija de residencia, correo/teléfono y contraseña.
  * No requiere ser admitido por un dirigente ni estar asociado a un grupo vecinal cerrado para acceder al directorio comercial o a las noticias zonales.
* **Enfoque exclusivo en oficios independientes:** Se descarta deliberadamente la importación de cadenas o negocios ya registrados en Google Maps. La plataforma existe para visibilizar a la gasfitera, electricista, carpintero, paseador de mascotas o costurera de la cuadra.
* **Selector de Radio de Búsqueda (Centrado en el Hogar):**
  * La distancia y los rangos de alcance (*300 m*, *500 m*, *1 km*) se calculan **siempre a partir de la residencia registrada por el usuario en la app**, no de su posición GPS transitoria. Esto asegura que los resultados estén verdaderamente a distancia caminable de su casa para mantener costos mínimos de transporte.
* **Marcador de "Favoritos":**
  * Permite al vecino guardar un listado personal de prestadores de confianza a los que ya ha recurrido, agilizando contrataciones recurrentes.
* **Sistema de "Visto Bueno Vecinal" (Reputación sin pasarela de pago):**
  1. La interacción inicia mediante un chat directo entre el vecino interesado y el prestador.
  2. No existen máquinas de estado complejas ni cotizaciones formales que generen fricción.
  3. **Flujo de Cierre en 1 Tap:** Al finalizar el trabajo, el prestador presiona el botón **`[ Solicitar Visto Bueno Vecinal ]`**.
  4. Al cliente le aparece en el chat una tarjeta de acción directa: *"¿Juan completó el servicio? Otórgale tu Visto Bueno (1 a 5 estrellas + reseña breve)"*.
  5. **Regla de integridad:** Solo usuarios validados en el sector pueden emitir el Visto Bueno, previniendo granjas de reseñas falsas.
* **Mecanismo de Reporte y Denuncia:**
  * Opción visible en perfiles y chats para reportar malas prácticas, cobros indebidos, perfiles fraudulentos o faltas de respeto. El reporte escala directamente al panel de los dirigentes barriales para moderación y sanción comunitaria.
* **Tablón de Noticias Zonales:**
  * Espacio informativo público que recopila avisos de interés vecinal general: cortes programados de agua/luz (Sedapal, Enel), faenas comunales, obras en pistas o alertas tempranas del distrito.
* **Directorio de Auxilio Barrial:** Puntos fijos de botiquines vecinales, zonas seguras de evacuación y teléfonos de emergencia geolocalizados a partir de la residencia registrada por el usuario.

### 2.2. Capa Privada (Comunidad, Apoyo Solidario y Red de Cuidado)

* **Control de acceso y gobernanza compartida:**
  * Para ingresar a la capa privada, el vecino solicita unirse indicando su dirección.
  * La solicitud es aprobada por un **dirigente barrial verificado**, quien confirma la residencia física.
  * El dirigente principal tiene la potestad de designar **co-administradores de manzana** para descentralizar la moderación.
* **Doble modo de visualización interactiva:**
  * **Modo Muro (Feed):** Línea de tiempo estructurada para enterarse de las necesidades y ofertas de ayuda activas.
  * **Modo Mapa:** Representación geoespacial del barrio que muestra dónde se necesitan herramientas, dónde hay donaciones disponibles y dónde se concentran las actividades comunitarias.
* **Muro Solidario Unificado (Sin dinero):**
  * Se evita la dispersión en múltiples foros. Todo el intercambio no monetario convive en un único feed segmentado por chips de filtrado rápido:
    * `[ Préstamo de herramientas ]`: Escaleras, taladros, herramientas de jardinería, etc.
    * `[ Donación de materiales ]`: Ropa, medicinas selladas, sobrantes de construcción.
    * `[ Trueque / Habilidades ]`: Intercambio de clases, apoyo técnico, tiempo.
    * `[ Voluntariado Comunitario ]`: Ollas comunes, comités de vaso de leche, polladas de salud o faenas de limpieza barrial.
    * `[ Movilidad solidaria ]`: Apoyo en traslados a centros médicos o emergencias vecinales.

---

## 3. Red de Acompañamiento y Cuidado de Personas Vulnerables

Para abordar la problemática real de adultos mayores, personas enfermas o vecinos en soledad sin comprometer su seguridad, se diseña un esquema específico:

### 3.1. ¿Dónde y cómo se visualiza la Red de Acompañamiento?
1. **En el Modo Mapa (Capa Privada):**
   * Existe una capa de visualización específica llamada **"Capa de Cuidado Vecinal"**.
   * **Acceso de Privacidad Estricto:** Esta capa **NO es visible para cualquier usuario nuevo o regular**. Está reservada exclusivamente para los **Dirigentes Barriales** y para los **Vecinos Enlace (Padrinos Vecinales)** asignados a esa manzana.
   * Muestra indicadores de estado preventivo sobre los hogares censados:
     * 🟢 **Al día:** Vecino visitado o contactado en los últimos 7 días.
     * 🟡 **Seguimiento requerido:** Requiere visita programada, entrega de víveres o compra de medicinas.
     * 🔴 **Alerta Activa:** Vecino activó el botón de auxilio o se reportó una necesidad urgente.
2. **En el Muro Solidario:**
   * Las tareas de soporte preventivo se publican como requerimientos con etiqueta especial `[ Cuidado Vecinal / Padrinazgo ]` (ejemplo: *"Se necesita un vecino voluntario para acompañar a Don Pedro al policlínico el martes a las 9 am"*). Cualquier vecino de la comunidad puede postularse para asumir la tarea.

### 3.2. Experiencia para la Persona Vulnerable que DISPONE de la Aplicación

Para aquellos adultos mayores o personas con discapacidad que sí cuentan con un smartphone con la app instalada, la aplicación ofrece un **Modo Accesible Adaptativo**:

* **Detección y Activación del Modo:** Se activa en el onboarding o desde un interruptor visible de accesibilidad (*"Modo Asistido / Adulto Mayor"*).
* **Transformación Radical de la Interfaz:**
  * **Tipografía Dinámica Gigante:** Textos escalados con tipografías sans-serif de alto contraste.
  * **Soporte Multilingüe (Inclusión Lingüística):** Selector de idioma para habilitar **Quechua** y Español en modo de lenguaje claro, facilitando el uso a adultos mayores migrantes.
  * **Ocultamiento de Ruido:** Se eliminan los menús complejos, gráficos densos y configuraciones avanzadas.
  * **Pantalla de Inicio Simplificada en 2 Elementos:**
    1. **Botón SOS de Auxilio Inmediato (Elemento Central):**
       * Botón de gran tamaño en la parte central de la pantalla.
       * Mecanismo antierror: requiere **mantener presionado durante 2 segundos** (con retroalimentación háptica y vibración) o confirmación por voz.
       * Al activarse, envía una alerta geolocalizada con sonido de prioridad a los teléfonos de sus Padrinos Vecinales y dirigentes de manzana.
    2. **Micrófono Asistente por Voz:**
       * Permite al usuario tocar la pantalla y decir lo que necesita en lenguaje natural: *"Me siento mal"*, *"No tengo agua"*, *"Necesito a mi vecina Carmen"*.
       * La IA transcribe la necesidad y la transforma en una solicitud prioritaria en el sistema.

---

## 4. Evolución y Gobernanza del Modo Emergencia

Ante un desastre natural (sismo, inundación, huaico), un incendio o un corte prolongado de suministros, la aplicación no añade pestañas ni confunde al usuario: **la interfaz muta íntegramente**.

```
┌────────────────────────────────────────────────────────┐
│                MODO DÍA A DÍA (NORMAL)                 │
│         [ Muro Solidario | Directorio Oficios ]        │
└───────────────────────────┬────────────────────────────┘
                            │ Activación por Dirigente /
                            │ Consenso de Reportes
                            ▼
┌────────────────────────────────────────────────────────┐
│               MODO EMERGENCIA ACTIVO                   │
│          TABLERO DE AYUDA HUMANITARIA                  │
├────────────────────────────────────────────────────────┤
│ 🚨 Alerta Principal y Estado del Evento                │
│ 📍 Mapa de Evacuación, Zonas Seguras y Botiquines      │
│ 🆘 Solicitudes de Rescate y Auxilio Médico Prioritarias│
│ 📦 Centro de Coordinación de Recursos Críticos         │
│    (Agua potable, generadores, herramientas de rescate)│
│ 👥 Mapeo Inmediato de Hogares Vulnerables              │
└────────────────────────────────────────────────────────┘
```

### 4.1. Gobernanza y Protocolo Antierror de Activación
Para impedir declaraciones accidentales de emergencia o situaciones de pánico innecesario:
1. **Activación Exclusiva por Dirigentes:** Solo perfiles con rol de dirigente barrial autenticado tienen acceso al interruptor de contingencia.
2. **Gesto "Slide to Activate" (Deslizar para Confirmar):**
   * Deslizador físico táctil que impide toques fortuitos.
   * Selección obligatoria del tipo de contingencia: *Sismo / Terremoto*, *Inundación / Huaico*, *Incendio urbano*, *Corte masivo de servicios esenciales*, *Seguridad vecinal*.
   * Cuenta regresiva visible de 5 segundos con botón de cancelación inmediata (*"Cancelar activación"*).
3. **Mecanismo de Detección de Crisis por Consenso:**
   * Si 3 vecinos no dirigentes de una misma manzana emiten alertas críticas de auxilio en un rango inferior a 10 minutos, la plataforma activa un estado de **Pre-Emergencia**.
   * Se envía una notificación push de alta prioridad a los teléfonos de los dirigentes con el resumen de los 3 reportes para su ratificación inmediata en 1 toque.

### 4.2. Experiencia en Emergencia para Usuarios de la Capa Pública (Incorporación Express)
Para aquellos vecinos que están registrados individualmente pero aún no forman parte de un grupo vecinal cerrado:
1. **Banner de Contingencia Zonal:** Si su sector entra en estado de emergencia, su pantalla principal despliega de inmediato una alerta destacada de alta prioridad:
   > *"⚠️ Tu sector se encuentra en Estado de Emergencia. El grupo vecinal más cercano está coordinando víveres, agua, botiquines y auxilio."*
2. **Llamado a la Acción Prioritario (`[ Solicitar Unión Express ]`):** Un botón prominente de 1 toque permite enviar una petición prioritaria para incorporarse al grupo vecinal más cercano a su domicilio registrado.
3. **Validación Acelerada para Dirigentes:** Como la residencia del vecino ya consta en su perfil, el dirigente recibe una solicitud de admisión con etiqueta de emergencia, permitiendo integrarlo en segundos al *Tablero de Ayuda Humanitaria* para que pueda dar o recibir soporte crítico.

---

## 5. Estrategia Omnicanal e Integración con WhatsApp

Para asegurar que los vecinos con baja alfabetización digital, sin espacio de almacenamiento en el móvil o que no desean instalar nuevas aplicaciones participen activamente, la plataforma se integra de manera bidireccional con una **Comunidad de WhatsApp**:

```
                              ┌────────────────────────────────────────┐
                              │            SISTEMA CENTRAL             │
                              │        Backend + IA + Base Datos       │
                              └───────┬────────────────────────┬───────┘
                                      │                        │
                    ┌─────────────────┴─┐                    ┌─┴─────────────────┐
                    │     APP MÓVIL     │                    │     WHATSAPP      │
                    │   (React Native)  │                    │                   │
                    ├───────────────────┤                    ├───────────────────┤
                    │ • Mapa interactivo│                    │ 1. Canal Avisos   │
                    │ • Muro solidario  │                    │    (Solo lectura, │
                    │ • Directorio      │                    │     cero spam)    │
                    │ • Modo Emergencia │                    │ 2. Bot de Ayuda   │
                    │                   │                    │    (Consultas por │
                    │                   │                    │     palabra clave)│
                    └───────────────────┘                    └───────────────────┘
```

### 5.1. Flujo para el Vecino en WhatsApp
1. **Canal de Avisos Comunitario (Solo Lectura):**
   * Canal oficial de la Comunidad de WhatsApp donde **únicamente el sistema y los dirigentes tienen permiso de publicación**.
   * Se publican alertas críticas de emergencia, cortes de servicios y noticias zonales oficiales.
   * Evita por completo la saturación por cadenas, stickers o discusiones ajenas.
2. **Bot Asistente de Consulta y Reporte:**
   * **Onboarding y Verificación:** El vecino escribe al bot; este le solicita su nombre y que comparta su ubicación nativa de WhatsApp (`Share Location`). La solicitud llega a la app del dirigente, quien al validarla, agrega automáticamente al vecino a la comunidad de WhatsApp.
   * **Búsqueda por Palabras Clave:**
     * El vecino escribe *"gasfitero"*, *"electricista"* o *"botiquín"*.
     * El bot responde con una ficha formateada con nombre, valoración del *Visto Bueno Vecinal* y un enlace directo de contacto: `https://wa.me/51987654321`.
   * **Publicación por Voz / Texto:**
     * El vecino envía un audio al bot (*"Vecinos, se me inundó el patio, ¿quién me puede prestar una bomba o baldes?"*).
     * El motor de IA transcribe y categoriza el requerimiento, publicándolo de inmediato en el Muro Solidario de la app móvil.

### 5.2. Conexión Bidireccional en la App (App $\rightarrow$ WhatsApp)
Cuando un vecino de WhatsApp publica un pedido, los usuarios de la app móvil lo visualizan con una tarjeta adaptada:
* **Insignia:** `[ 📱 Solicitud vía WhatsApp ]`.
* **Botón de Acción Directa:** **`[ 🟢 Responder por WhatsApp ]`**.
* Al tocar el botón, se abre WhatsApp en el teléfono del vecino con la app, con un chat directo hacia el vecino solicitante y un mensaje inicial autocompletado (*"Hola Doña Carmen, vi en la Red Vecinal que necesitas baldes..."*). De esta forma, ambos vecinos se comunican sin fricción tecnológica.

---

## 6. Inteligencia Artificial con Propósito (Voz a Ficha Estructurada)

La IA se implementa como una solución de accesibilidad e inclusión, no como un chatbot superficial:

```
[ Nota de Voz (Desde App Móvil o WhatsApp) ]
                      │
                      ▼
[ Modelo Multimodal / Speech-to-Text (Gemini API) ]
                      │
                      ▼
[ Extracción Estructurada JSON ]
  ├── tipo: "SOLICITUD_AYUDA" | "OFERTA_SERVICIO" | "EMERGENCIA"
  ├── categoria: "Gasfitería" | "Herramientas" | "Salud" | "Donación"
  ├── urgencia: "BAJA" | "MEDIA" | "ALTA_CRITICA"
  ├── descripcion: Resumen claro y normalizado
  └── ubicacion_referencial: Cuadra o manzana del emisor
                      │
                      ▼
[ Inserción Inmediata en Base de Datos y Notificación ] (≤ 3 seg)
```

* **Impacto:** Permite que cualquier persona publique ofertas de trabajo o solicitudes de auxilio simplemente hablando, garantizando el cumplimiento de la **regla de los 3 clics** incluso para quienes no saben o no pueden escribir en teclados táctiles pequeños.

---

## 7. Experiencia de Usuario: Onboarding y el Embudo de los 3 Clics

### 7.1. Tutorial Interactivo de Onboarding (Guía Rápida de 3 Pantallas)
Al abrir la app por primera vez, el vecino recorre un onboarding visual e interactivo de menos de 45 segundos:
1. **Tu Barrio a Pie:** Muestra cómo el mapa ubica oficios y ayudas dentro del radio caminable desde su hogar.
2. **Publica en 3 Toques:** Enseña cómo usar el botón flotante `+` o el micrófono para pedir u ofrecer sin llenar formularios.
3. **Tu Red Protectora:** Explica la activación del Modo Emergencia y el Botón SOS para vecinos vulnerables.

### 7.2. El Embudo de los 3 Clics para Publicación
Toda publicación en la aplicación móvil está diseñada para completarse en un máximo de 3 toques de pantalla:

| Paso | Acción del Usuario | Resultado en Pantalla |
| :---: | :--- | :--- |
| **Paso 1** | Tocar el Botón Flotante **`[ + ]`** (Crear) | Se despliega menú radial con 3 opciones: *Ofrecer Servicio*, *Pedir Ayuda*, *Aporte Solidario*. |
| **Paso 2** | Seleccionar Categoría (ej: *[Gasfitería]* o *[Herramientas]*) | Se abre la tarjeta de publicación con la ubicación autocompletada por el hogar registrado. |
| **Paso 3** | Grabar nota de voz rápida o tocar **`[ Publicar ]`** | La IA procesa el contenido y la publicación queda activa en el muro/mapa. |

---

## 8. Arquitectura Técnica y Resiliencia Offline-First

Dado que durante un sismo o desastre las redes celulares sufren cortes o congestión severa, la arquitectura técnica garantiza operatividad sin conexión:

```
┌────────────────────────────────────────────────────────┐
│                   REACT NATIVE APP                     │
├────────────────────────────┬───────────────────────────┤
│     Caché Local Persistente│   Patrón Outbox           │
│     (SQLite / WatermelonDB)│   (Bandeja de Sincronía)  │
├────────────────────────────┼───────────────────────────┤
│ • Directorio de auxilio    │ • Encola reportes y SOS   │
│ • Contactos de brigadistas │   creados sin red         │
│ • Datos del grupo vecinal  │ • Reintento y sincronía   │
│ • Mapas vectoriales caché  │   automática al reconectar│
└────────────────────────────┴───────────────────────────┘
```

* **Almacenamiento Local Robusto:** Directorios de teléfonos de emergencia, brigadistas, botiquines y los últimos datos del grupo vecinal residen en la base de datos local del móvil. La app nunca muestra pantallas en blanco por falta de internet.
* **Patrón Outbox:** Todo reporte emitido sin conexión se guarda localmente con marca de tiempo. Apenas el dispositivo detecta conexión a datos móviles o Wi-Fi, la cola se vacía hacia el servidor central.

---

## 9. Cronograma de Implementación (Hackathon 48 Horas)

| Bloque Temporal | Foco de Desarrollo | Entregable Funcional Demostrable |
| :--- | :--- | :--- |
| **Horas 00 - 10** | **Fundaciones & UI Base** | Proyecto en React Native, base de datos local SQLite, configuración del tema accesible (Español/Quechua), onboarding y navegación de 2 capas. |
| **Horas 10 - 20** | **Capa Pública, Favoritos y Visto Bueno** | Directorio de oficios por radio desde el hogar, filtros, favoritos, chat directo, reporte de abusos y flujo de Visto Bueno en 1 tap. |
| **Horas 20 - 30** | **Capa Privada y Modo Accesible** | Muro Solidario con chips, vista de mapa para Padrinos Vecinales y pantalla simplificada para adultos mayores con botón SOS de 2s. |
| **Horas 30 - 38** | **Gobernanza y Modo Emergencia** | Control "Slide to Activate", mutación visual instantánea al Tablero de Ayuda Humanitaria y detección por consenso. |
| **Horas 38 - 44** | **WhatsApp Bridge e IA de Voz** | Webhook de WhatsApp con procesamiento de audios vía Gemini API, tablón de noticias zonales y deep links `wa.me` bidireccionales. |
| **Horas 44 - 48** | **Pruebas de Resiliencia y Pitch** | Validación de flujo offline (modo avión), ensayo de demo en vivo y preparación del pitch para el jurado. |
