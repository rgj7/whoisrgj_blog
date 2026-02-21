/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#c9dae8',
          100: '#8aa5bc',
          200: '#5d7e96',
          300: '#5a91bf',
          400: '#78aed6',
          500: '#2a4a65',
          600: '#1e384f',
          700: '#1a2f44',
          800: '#152535',
          900: '#0d1b2a',
          950: '#060f1a',
        },
      },
    },
  },
  plugins: [],
}
