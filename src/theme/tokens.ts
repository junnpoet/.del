/**
 * Sumayni Design Tokens
 * Philosophy: Modern, clean, and elegant interface inspired by minimalist digital health / productivity apps.
 * Palette: Crisp whites, soft neutral grays (#F8F9FA, #F1F3F6), subtle shadows, and selective primary accents.
 * Typography: Plus Jakarta Sans for refined, contemporary legibility.
 */

export const sumayniColors = {
  // Acentos de Acción (utilizados selectivamente en botones y elementos destacados)
  primary: {
    DEFAULT: '#1E5E45', // Verde esmeralda profundo y sobrio
    light: '#348B68',   // Verde suave para estados secundarios
    dark: '#144331',    // Verde bosque sobrio
    tint: '#EDF5F1',    // Tinte muy suave para fondos activos
  },
  earth: {
    DEFAULT: '#9A5B32', // Terracota sobrio
    dark: '#583018',
    tint: '#FBF3EE',
  },
  sun: {
    DEFAULT: '#D97706', // Ámbar cálido para valoraciones y favoritos
    dark: '#92400E',
    tint: '#FEF3C7',
  },
  // Base Neutral: Blancos y Grises Graduales
  neutral: {
    background: '#F8F9FA', // Gris claro limpio y fresco (base de pantalla)
    surface: '#FFFFFF',    // Blanco puro para tarjetas elevadas
    card: '#FFFFFF',
    mutedBg: '#F1F3F6',    // Gris neutro suave para contenedores, píldoras y switches
    subtleBg: '#F8F9FB',   // Gris ultra claro
    border: '#E9ECEF',     // Borde milimétrico sutil (apenas perceptible)
    textMain: '#1A1D20',   // Carbón casi negro elegante
    textMuted: '#6C727A',  // Gris medio legible
    textLight: '#9EA3AE',  // Gris suave para metadatos secundarios
  },
  // Modo Emergencia (Alta Visibilidad pero sobrio)
  emergency: {
    alert: '#DC2626',      // Rojo carmín de alerta
    tint: '#FEE2E2',       // Rosa sutil
    warning: '#D97706',
    safe: '#16A34A',
    background: '#121417',
    cardDark: '#1E2126',
  },
};

export const touchTargets = {
  min: 48,
  accessible: 60,
};

export const typography = {
  fonts: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
  },
  fontSizes: {
    xs: 12,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
};
