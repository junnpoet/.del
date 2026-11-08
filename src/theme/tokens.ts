/**
 * Sumayni Design Tokens
 * Philosophy: Warm Andean earthen tones for everyday neighborly collaboration,
 * combined with high-contrast emergency signals and accessible touch targets (>= 48dp).
 */

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
    textMain: '#1F2937', // Alto contraste (WCAG AAA)
    textMuted: '#6B7280',
  },
  // Modo Emergencia (Alta Visibilidad y Señalética)
  emergency: {
    alert: '#D90429', // Rojo señalética urgente
    warning: '#F77F00', // Naranja atención
    safe: '#2B9348', // Verde zona segura
    background: '#121212', // Fondo oscuro de contingencia
    cardDark: '#1E1E1E',
  },
};

export const touchTargets = {
  min: 48, // Minimum standard touch target (48x48 dp)
  accessible: 64, // Adaptive accessible mode for seniors (64x64 dp)
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    accessibleBase: 20,
    accessibleLg: 26,
    accessibleXl: 34,
  },
};
