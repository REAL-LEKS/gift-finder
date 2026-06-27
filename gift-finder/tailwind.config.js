/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          400: '#059669',
          500: '#064E3B',
          600: '#065F46',
          700: '#047857',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          400: '#D97706',
          500: '#85660D',
          600: '#6B4D0A',
          700: '#4D3507',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'luxury': '0 4px 24px 0 rgba(6,78,59,0.10)',
        'luxury-md': '0 8px 32px 0 rgba(6,78,59,0.14)',
      },
    },
  },
  plugins: [],
}
