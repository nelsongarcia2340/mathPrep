/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lagoon: {
          50: '#eefdfb',
          100: '#d5f8f2',
          500: '#21b8a5',
          600: '#168f82',
        },
        coral: {
          50: '#fff1ed',
          100: '#ffe0d6',
          500: '#f9735b',
        },
        ink: '#1d2939',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(29, 41, 57, 0.08)',
      },
    },
  },
  plugins: [],
};
