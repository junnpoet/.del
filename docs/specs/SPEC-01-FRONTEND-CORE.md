# SPEC-01: Frontend Core, Design System & Arquitectura Base

| Metadato | Detalle |
| :--- | :--- |
| **Responsable (Owner)** | **Juan** (Lead Frontend & Design System) |
| **Módulo** | Núcleo de Aplicación Móvil, Sistema de Diseño y Navegación |
| **Dependencias Salientes** | Ninguna (Bloqueante para SPEC-03, SPEC-04 y SPEC-05) |
| **Stack Técnico** | Expo SDK, React Native, NativeWind v4, Expo Router, TanStack Query v5 |

---

## 1. Objetivo

Establecer los cimientos del frontend móvil de **Sumayni**, implementando el sistema de diseño accesible, la configuración de Tailwind (NativeWind v4), la jerarquía de navegación y la infraestructura transversal de persistencia offline que utilizará el resto del equipo.

---

## 2. Tokens de Diseño de Sumayni (`src/theme/tokens.ts`)

La paleta traduce la filosofía de colores neutros, cálidos y no estresantes, con soporte de alto contraste para adultos mayores:

```typescript
export const sumayniColors = {
  // Modo Cotidiano (Cálido, Humano, Bienestar)
  primary: {
    DEFAULT: '#2D6A4F', // Verde arcilla andino (equilibrio y comunidad)
    light: '#40916C',
    dark: '#1B4332',
  },
  earth: {
    DEFAULT: '#B08968', // Tono arcilla/terracota suave
    light: '#DDB892',
    dark: '#7F5539',
  },
  neutral: {
    background: '#F8F9FA', // Blanco hueso (no fatiga la vista)
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E7EB',
    textMain: '#1F2937',  // Alto contraste (WCAG AAA)
    textMuted: '#6B7280',
  },
  // Modo Emergencia (Alta Visibilidad y Señalética)
  emergency: {
    alert: '#D90429',     // Rojo señalética urgente
    warning: '#F77F00',   // Naranja atención
    safe: '#2B9348',      // Verde zona segura
    background: '#121212',// Fondo oscuro de contingencia
    cardDark: '#1E1E1E',
  },
};
```

* **Regla de Accesibilidad Táctil:** Todo elemento interactivo (`Button`, `Chip`, `IconTouchable`) debe tener un área mínima de toque de **$48 \times 48$ dp** (o **$64 \times 64$ dp** en Modo Accesible Adaptativo).

---

## 3. Componentes Base a Construir (`src/components/ui/`)

1. **`Button`:** Variantes `primary`, `secondary`, `outline`, `emergency` (con soporte para estado deshabilitado, loading y tamaño grande accesible).
2. **`Card`:** Contenedor estilizado con elevación suave, bordes redondeados y compatibilidad de temas.
3. **`Chip`:** Píldora táctil seleccionable con estado activo/inactivo para filtros de oficios y muro solidario.
4. **`Header`:** Barra superior con título claro, botón de regreso accesible y switch de rol/modo.
5. **`Input`:** Campo de texto con tipografía de alto contraste, label visible y soporte para entrada por voz.
6. **`Modal`:** Contenedor modal accesible para confirmaciones y flujos rápidos de 1 tap.
7. **`QuickPublishFAB` (Embudo de los 3 Clics):** Botón flotante global `[ + ]` que despliega el menú radial rápido (*Ofrecer Servicio*, *Pedir Ayuda*, *Aporte Solidario*) y el modal de grabación de audio con `expo-av` para estructuración por voz.

---

## 4. Estructura de Navegación (`app/`) con Expo Router

```
app/
├── _layout.tsx               # Root Layout con QueryClientProvider y Temas
├── (onboarding)/
│   ├── index.tsx             # Pantalla 1: Tu barrio a pie
│   ├── step2.tsx             # Pantalla 2: Publica en 3 toques
│   └── step3.tsx             # Pantalla 3: Red protectora y SOS
├── (auth)/
│   ├── login.tsx             # Login individual
│   └── register.tsx          # Registro obligatorio (nombres, dirección del hogar, GPS)
├── (main)/
│   ├── _layout.tsx           # Tab Bar inferior accesible
│   ├── index.tsx             # Capa Pública: Directorio de oficios y noticias
│   ├── community.tsx         # Capa Privada: Muro solidario y mapa
│   └── profile.tsx           # Mi perfil, hogar registrado y favoritos
└── emergency-board.tsx       # Tablero de contingencia al mutar por alerta
```

---

## 5. Infraestructura Offline-First Transversal (`src/services/queryClient.ts`)

Configuración de **TanStack Query** con persistencia en AsyncStorage:

```typescript
import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 horas en disco
      staleTime: 1000 * 60 * 5,     // 5 minutos de validez
      networkMode: 'offlineFirst',  // Consulta siempre caché si no hay señal
    },
    mutations: {
      networkMode: 'offlineFirst',  // Encola mutaciones locales si falla la red
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
```

---

## 6. Criterios de Aceptación (Checklist de Juan)

- [ ] Proyecto Expo iniciado y corriendo con hot reload en móvil físico.
- [ ] NativeWind v4 configurado con los tokens de color de **Sumayni** en `tailwind.config.js`.
- [ ] Componentes base creados en `src/components/ui/` con áreas táctiles $\ge 48$dp.
- [ ] Flujo de Onboarding de 3 pantallas completado y almacena flag en AsyncStorage (`has_seen_onboarding`).
- [ ] Pantalla de registro individual con geocodificación fija de residencia en `profiles.home_location`.
- [ ] Componente `QuickPublishFAB` (Embudo de 3 toques) implementado y accesible en el layout global.
- [ ] Navegación configurada con Expo Router y Tab Bar visible con iconos intuitivos.
- [ ] QueryClient configurado con `createAsyncStoragePersister` probado con modo avión.
