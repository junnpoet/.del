# Matriz de Usuarios de Prueba (Inicio de Sesión en Sumayni)

Para probar los diferentes roles y capas de la aplicación ([docs/PROPUESTA.md](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/PROPUESTA.md)), ingresa a la pantalla de **Iniciar Sesión** con cualquiera de los siguientes números de celular y la contraseña unificada:

> 🔑 **Contraseña para todos los usuarios de prueba:** `123456`

Todos los usuarios residen en **Urbanización Bellamar (Nuevo Chimbote)**, alrededor de la ubicación de **Juan López** y dentro de la cobertura de la **Junta Vecinal Urb. Bellamar**.

---

## 1. Juan López (Vecino Nuevo — Solo Capa Pública)
* **Teléfono Celular:** `947411396`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Calle 23 Mz. Ñ - Lt. 9, Urbanización Bellamar
* **Estado de Membresía:** `NO_SOLICITADO`
* **¿Qué probar con este usuario?**
  1. **Capa Pública (Pestaña "Directorio"):**
     - Explora la lista y el mapa interactivo (vista mapa y vista satélite) con pines de vecinos cercanos ofreciendo **Servicios**, **Productos** y **Auxilio** (incluido el pin multicolor de Brandon Mauricio).
     - Filtra por `Servicios`, `Productos`, `Auxilio` y favoritos (`3` guardados).
     - Abre **Chats** para continuar las conversaciones activas con *Brandon Mauricio* y *Gadiel Zúñiga*.
  2. **Publicación Rápida (`+`):**
     - Verás habilitada **Ofrecer un Servicio** y bloqueadas las opciones privadas (*Pedir Ayuda* y *Aporte Solidario*) por no pertenecer aún a la comunidad.
  3. **Control de Acceso a Capa Privada (Pestaña "Comunidad"):**
     - Verás la pantalla de bloqueo con candado y el botón **`Solicitar Ingreso a la Junta Vecinal`**.

---

## 2. Gadiel Zúñiga (Dirigente Barrial — Urb. Bellamar)
* **Teléfono Celular:** `971825787`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Calle 22 Mz. M - Lt. 4, Urbanización Bellamar
* **Estado de Membresía:** `DIRIGENTE` (Líder de *Junta Vecinal Urb. Bellamar*)
* **¿Qué probar con este usuario?**
  1. **Aprobación de Solicitudes (Pestaña "Comunidad"):**
     - Verás el banner de dirigencia con **1 solicitud pendiente** (*Ronaldinho Villanueva*).
     - Abre el modal de revisión y aprueba su ingreso a la junta vecinal.
  2. **Capa de Cuidado Vecinal (Pestaña "Comunidad" → Mapa Barrial):**
     - Visualiza el seguimiento preventivo de *Mauro Lázaro* (`SEGUIMIENTO_REQUERIDO`).
  3. **Muro Solidario y Publicaciones:**
     - Acceso total a las 3 opciones de **`+` Publicar** y gestión de la comunidad.
  4. **Protocolo SOS / Emergencias:**
     - Acceso prioritario al tablero de contingencia vecinal.

---

## 3. Brandon Mauricio (Miembro Verificado y Prestador Multioferta)
* **Teléfono Celular:** `935860401`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Av. Pacífico Mz. K - Lt. 12, Urbanización Bellamar
* **Estado de Membresía:** `MIEMBRO`
* **¿Qué probar con este usuario?**
  1. **Pin Multicolor en Directorio:**
     - Tiene publicados **Servicios** (*Gasfitería*, *Electricidad*) y un **Producto** (*Kit de caños y repuestos PVC*) en la misma ubicación, ideal para probar el pin combinado en el mapa.
  2. **Muro Solidario y Red de Cuidado:**
     - Es miembro verificado con acceso completo al Muro Solidario (préstamo de escalera/taladro y voluntariado) y figura como **padrino** de *Mauro Lázaro*.
  3. **Chats:**
     - Tiene conversación activa con *Juan López* sobre reparación de fugas.

---

## 4. Mauro Lázaro (Adulto Mayor / Persona Vulnerable)
* **Teléfono Celular:** `907530293`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Calle 24 Mz. O - Lt. 6, Urbanización Bellamar
* **Estado de Membresía:** `MIEMBRO` (`is_vulnerable: true`)
* **¿Qué probar con este usuario?**
  1. **Modo Asistido / Adulto Mayor:**
     - Cuenta con una solicitud activa de **AYUDA** en el Muro Solidario (*"Apoyo para subir dos bidones de agua..."*) con comentarios y voluntario asignado (*Brandon Mauricio*).
  2. **Red de Cuidado y SOS:**
     - Está registrado en seguimiento preventivo (`SEGUIMIENTO_REQUERIDO`) y puede activar el botón **`SOS`** para el Tablero de Contingencia.

---

## 5. Ronaldinho Villanueva (Vecino con Solicitud Pendiente)
* **Teléfono Celular:** `947646767`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Jr. Los Cipreses Mz. L - Lt. 3, Urbanización Bellamar
* **Estado de Membresía:** `PENDIENTE` (Solicitud enviada a *Junta Vecinal Urb. Bellamar*)
* **¿Qué probar con este usuario?**
  1. **Capa Pública Activa:**
     - Ofrece un **Servicio** (*Refuerzo escolar y matemáticas*) y un **Producto** (*Muebles pequeños y repisas de madera*) visibles para todo el barrio.
  2. **Estado Pendiente en Comunidad:**
     - Al entrar a la pestaña **Comunidad**, verá la pantalla de **"Confirmando tu Residencia"** hasta que *Gadiel Zúñiga* lo apruebe desde el panel de dirigencia.

---

## ¿Cómo cambiar de usuario?
1. Ve a la pestaña **Perfil** (ícono de usuario en la barra inferior).
2. Desplázate al final y presiona **`Cerrar Sesión`**.
3. En la pantalla de inicio de sesión, ingresa cualquiera de los 5 números de celular indicados arriba con la contraseña `123456` y presiona **`Ingresar a mi Barrio`**.
