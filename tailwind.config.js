/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito_600SemiBold'],
        regular: ['Nunito_400Regular'],
        medium: ['Nunito_600SemiBold'],
        semibold: ['Nunito_700Bold'],
        bold: ['Nunito_800ExtraBold'],
        extrabold: ['Nunito_900Black'],
      },
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          dark: '#1B4332',
          pastel: '#D8F3DC',
          soft: '#B7E4C7',
        },
        earth: {
          DEFAULT: '#C87D55',
          light: '#E6A17C',
          dark: '#6D3B1E',
          pastel: '#FFE5D9',
          soft: '#FCD5CE',
        },
        sun: {
          DEFAULT: '#E09F3E',
          dark: '#7C4D12',
          pastel: '#FEF3C7',
        },
        neutral: {
          background: '#FAF6F0',
          surface: '#FFFDF9',
          card: '#FFFFFF',
          mutedBg: '#F3EDE2',
          border: '#E6DEC8',
          textMain: '#1E293B',
          textMuted: '#57534E',
        },
        emergency: {
          alert: '#E03131',
          pastel: '#FFE3E3',
          warning: '#F08C00',
          safe: '#2F9E44',
          background: '#18181B',
          cardDark: '#27272A',
        },
      },
      minHeight: {
        touch: '54px',
        'touch-accessible': '68px',
      },
      minWidth: {
        touch: '54px',
        'touch-accessible': '68px',
      },
    },
  },
  plugins: [],
};
