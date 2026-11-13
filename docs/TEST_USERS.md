# Matriz de Usuarios de Prueba (Inicio de Sesión en Sumayni)

Para probar los diferentes roles y capas de la aplicación ([docs/PROPUESTA.md](file:///home/lucille/Workspace/3_Hackathons/5_Hackathon_El_Comercio_2026/docs/PROPUESTA.md)), ingresa a la pantalla de **Iniciar Sesión** con cualquiera de los siguientes números de celular y la contraseña unificada:

> 🔑 **Contraseña para todos los usuarios de prueba:** `123456`

Todos los usuarios residen en **Urbanización Bellamar (Nuevo Chimbote)**, alrededor de la ubicación de **Juan López** y dentro de la cobertura de la **Junta Vecinal Urb. Bellamar**.

---

## 1. Juan López (Dirigente Barrial — Urb. Bellamar)
* **Teléfono Celular:** `947411396`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Calle 23 Mz. Ñ - Lt. 9, Urbanización Bellamar
* **Estado de Membresía:** `DIRIGENTE` (Líder de *Junta Vecinal Urb. Bellamar*)
* **¿Qué probar con este usuario?**
  1. **Aprobación de Solicitudes (Pestaña "Comunidad"):**
     - Verás el banner de dirigencia con **1 solicitud pendiente** (*Ronaldinho Villanueva*).
     - Abre el modal de revisión y aprueba su ingreso a la junta vecinal.
  2. **Capa de Cuidado Vecinal (Pestaña "Comunidad" → Mapa Barrial):**
     - Visualiza el seguimiento preventivo de *Mauro Lázaro* (`SEGUIMIENTO_REQUERIDO`).
  3. **Capa Pública, Favoritos y Chats:**
     - Explora el Directorio (Servicios, Productos y Auxilio), sus `3` favoritos guardados y sus `2` chats activos con *Brandon Mauricio* y *Gadiel Zúñiga*.
  4. **Publicación Rápida (`+`) y Protocolo SOS:**
     - Acceso total a las 3 opciones de **`+` Publicar** y al tablero de contingencia vecinal.

---

## 2. Gadiel Zúñiga (Miembro Verificado y Oferente Activo)
* **Teléfono Celular:** `971825787`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Calle 22 Mz. M - Lt. 4, Urbanización Bellamar
* **Estado de Membresía:** `MIEMBRO` (Integrado a *Junta Vecinal Urb. Bellamar*)
* **¿Qué probar con este usuario?**
  1. **Capa Pública y Pin Multicolor (Pestaña "Directorio"):**
     - Ofrece **Servicio** (*Cerrajería 24h*), **Producto** (*Muebles y repisas de madera*) y **Auxilio** (*Botiquín de emergencia y curaciones*), generando un pin combinado de los 3 colores en el mapa.
     - Abre **Chats** para ver su conversación activa con *Juan López*.
  2. **Capa Privada y Publicación Rápida (`+`):**
     - Acceso completo al **Muro Solidario** (tiene publicada una donación de víveres/frazadas) y a las 3 opciones de **`+` Publicar**.

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

## 5. Ronaldinho Villanueva (Vecino Nuevo con Solicitud Pendiente)
* **Teléfono Celular:** `947646767`
* **Contraseña:** `123456`
* **Domicilio Georreferenciado:** Jr. Los Cipreses Mz. L - Lt. 3, Urbanización Bellamar
* **Estado de Membresía:** `PENDIENTE` (Solicitud enviada a *Junta Vecinal Urb. Bellamar*)
* **¿Qué probar con este usuario?**
  1. **Capa Pública:**
     - Explora el Directorio y puede publicar un servicio público desde **`+` Publicar** (con las opciones privadas bloqueadas hasta ser aprobado).
  2. **Estado Pendiente en Comunidad:**
     - Al entrar a la pestaña **Comunidad**, verá la pantalla de **"Confirmando tu Residencia"** hasta que *Juan López* lo apruebe desde el panel de dirigencia.

---

## ¿Cómo cambiar de usuario?
1. Ve a la pestaña **Perfil** (ícono de usuario en la barra inferior).
2. Desplázate al final y presiona **`Cerrar Sesión`**.
3. En la pantalla de inicio de sesión, ingresa cualquiera de los 5 números de celular indicados arriba con la contraseña `123456` y presiona **`Ingresar a mi Barrio`**.
