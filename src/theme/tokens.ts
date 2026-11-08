/**
 * Sumayni Design Tokens
 * Philosophy: Friendly, rounded, pastel-warm Andean palette with high-contrast
 * typography (WCAG AAA) and generous touch targets (>= 52dp standard, >= 68dp accessible).
 */

export const sumayniColors = {
  // Modo Cotidiano (Pasteles Cálidos + Contraste Profundo)
  primary: {
    DEFAULT: '#2D6A4F', // Verde arcilla profundo (botones y acentos de alto contraste)
    light: '#52B788',   // Verde hoja suave
    dark: '#1B4332',    // Verde bosque oscuro (texto sobre fondos pastel)
    pastel: '#D8F3DC',  // Verde menta/salvia pastel (fondos amigables y píldoras)
    soft: '#B7E4C7',    // Borde pastel verde
  },
  earth: {
    DEFAULT: '#C87D55', // Terracota cálido amigable
    light: '#E6A17C',
    dark: '#6D3B1E',    // Tierra oscura para alto contraste sobre pastel
    pastel: '#FFE5D9',  // Durazno/terracota pastel (fondos de tarjetas y sellos)
    soft: '#FCD5CE',    // Coral pastel suave
  },
  sun: {
    DEFAULT: '#E09F3E', // Miel cálido
    dark: '#7C4D12',    // Ámbar oscuro para texto
    pastel: '#FEF3C7',  // Amarillo miel pastel
  },
  neutral: {
    background: '#FAF6F0', // Crema avena pastel cálido (cero frío hospitalario)
    surface: '#FFFDF9',    // Marfil suave
    card: '#FFFFFF',       // Blanco limpio para tarjetas sobre crema
    mutedBg: '#F3EDE2',    // Arena pastel para contenedores secundarios
    border: '#E6DEC8',     // Borde arena cálido
    textMain: '#1E293B',   // Pizarra profundo (alto contraste)
    textMuted: '#57534E',  // Piedra cálido legible (nunca gris pálido)
  },
  // Modo Emergencia (Alta Visibilidad + Fondos Pastel de Alerta)
  emergency: {
    alert: '#E03131',      // Rojo coral intenso de emergencia
    pastel: '#FFE3E3',     // Rosa/coral pastel para avisos de ayuda
    warning: '#F08C00',    // Naranja ámbar
    safe: '#2F9E44',       // Verde zona segura
    background: '#18181B', // Fondo nocturno de contingencia
    cardDark: '#27272A',   // Tarjeta oscura
  },
};

export const touchTargets = {
  min: 54,        // Generous standard touch target (54x54 dp)
  accessible: 68, // Adaptive accessible mode for seniors (68x68 dp)
};

export const typography = {
  fonts: {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_600SemiBold',
    semibold: 'Nunito_700Bold',
    bold: 'Nunito_800ExtraBold',
    black: 'Nunito_900Black',
  },
  fontSizes: {
    sm: 15,
    base: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
    accessibleBase: 22,
    accessibleLg: 28,
    accessibleXl: 36,
  },
};
