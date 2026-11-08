/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // 'class' permite que NativeWind cambie el esquema de color en web sin lanzar
  // "Cannot manually set color scheme, as dark mode is type 'media'".
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['PlusJakartaSans_500Medium'],
        regular: ['PlusJakartaSans_400Regular'],
        medium: ['PlusJakartaSans_500Medium'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
        extrabold: ['PlusJakartaSans_800ExtraBold'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E5E45',
          light: '#348B68',
          dark: '#144331',
          tint: '#EDF5F1',
        },
        earth: {
          DEFAULT: '#9A5B32',
          dark: '#583018',
          tint: '#FBF3EE',
        },
        sun: {
          DEFAULT: '#D97706',
          dark: '#92400E',
          tint: '#FEF3C7',
        },
        neutral: {
          background: '#F8F9FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          mutedBg: '#F1F3F6',
          subtleBg: '#F8F9FB',
          border: '#E9ECEF',
          textMain: '#1A1D20',
          textMuted: '#6C727A',
          textLight: '#9EA3AE',
        },
        emergency: {
          alert: '#DC2626',
          tint: '#FEE2E2',
          warning: '#D97706',
          safe: '#16A34A',
          background: '#121417',
          cardDark: '#1E2126',
        },
      },
      minHeight: {
        touch: '48px',
        'touch-accessible': '60px',
      },
      minWidth: {
        touch: '48px',
        'touch-accessible': '60px',
      },
    },
  },
  plugins: [],
};
