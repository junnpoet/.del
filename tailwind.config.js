/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          dark: '#1B4332',
        },
        earth: {
          DEFAULT: '#B08968',
          light: '#DDB892',
          dark: '#7F5539',
        },
        neutral: {
          background: '#F8F9FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E5E7EB',
          textMain: '#1F2937',
          textMuted: '#6B7280',
        },
        emergency: {
          alert: '#D90429',
          warning: '#F77F00',
          safe: '#2B9348',
          background: '#121212',
          cardDark: '#1E1E1E',
        },
      },
      minHeight: {
        touch: '48px',
        'touch-accessible': '64px',
      },
      minWidth: {
        touch: '48px',
        'touch-accessible': '64px',
      },
    },
  },
  plugins: [],
};
