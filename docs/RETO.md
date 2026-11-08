# Reto Hackathon El Comercio 2026: Red Vecinal de Proximidad y Solidaridad

## Declaración del Reto

> **Objetivo:** Desarrollar en 48 horas una aplicación móvil enfocada en la comunidad barrial que permita a los ciudadanos acceder a productos, oficios y servicios a costos mínimos y sin requerir desplazamientos largos, respaldados por la confianza y recomendación de sus propios vecinos. La plataforma integra mecanismos de economía solidaria (sin dinero) y cuenta con la capacidad de evolucionar a un modo de contingencia en situaciones de emergencia para coordinar auxilio y recursos críticos.

---

## 1. Modos de Operación y Módulos Clave

La plataforma opera bajo dos dinámicas complementarias que transforman su comportamiento según el contexto comunitario:

```
┌─────────────────────────────────────────────────────────────┐
│                      APLICATIVO VECINAL                     │
├──────────────────────────────┬──────────────────────────────┤
│    MODO NORMAL (Día a Día)   │       MODO EMERGENCIA        │
├──────────────────────────────┼──────────────────────────────┤
│ 1. Servicios de Proximidad   │ 1. Soporte Crítico           │
│    • Directorio barrial      │    • Directorio de brigadas  │
│    • "Visto Bueno Vecinal"   │      y servicios de auxilio  │
├──────────────────────────────┼──────────────────────────────┤
│ 2. Cadena de Favores         │ 2. Ayuda Humanitaria         │
│    • Muro sin dinero         │    • Reportes geolocalizados │
│    • Trueque y préstamos     │    • Reparto de recursos     │
└──────────────────────────────┴──────────────────────────────┘
```

### Módulo 1: Servicios de Proximidad (Economía Local)
Conecta la oferta laboral de cercanía y visibiliza oficios y profesionales dentro del barrio.

* **En el día a día:**
  * Directorio geolocalizado de oficios y servicios (gasfitería, carpintería, electricidad, cerrajería, paseadores de mascotas, clases particulares, etc.).
  * Sistema de validación por **"Visto Bueno Vecinal"** (respaldo y recomendaciones exclusivas de vecinos de la misma zona para generar confianza real).
* **Durante una emergencia:**
  * Transición automática a un directorio de soporte para contingencias críticas o complejas (identificación de personal de salud, brigadistas, primeros auxilios, albergues temporales).

### Módulo 2: Cadena de Favores & Red de Solidaridad (Economía Solidaria)
Muro colaborativo diseñado para resolver necesidades vecinales sin intermediación monetaria.

* **En el día a día:**
  * Muro comunitario para publicar ofertas y solicitudes sin dinero:
    * Préstamo temporal de herramientas y equipos.
    * Donación de materiales no utilizados.
    * Intercambio de habilidades / banco de tiempo.
    * Movilidad o traslados solidarios.
* **Durante una emergencia:**
  * **Tablero de ayuda humanitaria:** Mapeo geolocalizado de vecinos en situación de vulnerabilidad (adultos mayores, personas aisladas, emergencias médicas o de suministros).
  * **Espacio de economía solidaria crítica:** Coordinación y distribución comunitaria de víveres, agua potable, medicinas, generadores o refugio.

---

## 2. Requisitos de Experiencia y Arquitectura Técnica

| Dimensión | Requisito | Detalle / Criterio de Diseño |
| :--- | :--- | :--- |
| **UX Móvil** | Regla de los 3 clics | Publicación ágil de necesidades o servicios en un máximo de 3 toques/clics. |
| **Conectividad** | Soporte Online / Offline | Funcionamiento resiliente con sincronización local cuando se corte la conectividad (fundamental en emergencias). |
| **Geolocalización** | Filtro por proximidad | Mapeo visual y listado ordenado por radio de cercanía (evitar transporte mayor). |
| **Accesibilidad** | Inclusivo e intuitivo | UI clara, tipografías legibles y contrastes accesibles para adultos mayores o vecinos con baja alfabetización digital. |
| **Onboarding** | Tutorial integrado | Guía rápida de uso al primer inicio para entender la dinámica vecinal y el botón de emergencia. |

---

## 3. Matriz Comparativa de Funcionalidades

| Funcionalidad | Escenario Cotidiano (Día a Día) | Escenario de Crisis (Emergencia) |
| :--- | :--- | :--- |
| **Directorio** | Oficios locales con "Visto Bueno Vecinal" | Servicios de auxilio, rescatistas y grupos de apoyo |
| **Intercambio** | Muro de favores, préstamos de herramientas y trueque | Coordinación de víveres, medicamentos y refugio |
| **Mapa** | Ubicación de ofertas y comercios de barrio | Puntos de reunión y reportes de vecinos vulnerables |
| **Alertas** | Notificaciones de nuevas recomendaciones en la zona | Alertas de contingencia comunitaria |

---

## 4. Checklist para el Desarrollo (Entregables 48h)

- [ ] **Módulo de Publicación Ultra-rápido:** Formulario de oferta/demanda operable en $\le$ 3 pasos.
- [ ] **Directorio con Reputación Barrial:** Vista de oficios con contador/insignias de "Visto Bueno Vecinal".
- [ ] **Muro de Solidaridad:** Categorías específicas para préstamos, donaciones y favores sin intercambio monetario.
- [ ] **Interruptor / Modo Emergencia:** Cambio de estado de la app hacia tablero de contingencia geolocalizado.
- [ ] **Estrategia Offline-first:** Persistencia local (IndexedDB / SQLite / AsyncStorage) con cola de sincronización.
- [ ] **Tutorial de Bienvenida:** Onboarding guiado simple y visual.
