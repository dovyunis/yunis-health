/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f6',
          100: '#d3ece9',
          500: '#0f9d8f',
          600: '#0c8175',
          700: '#0a685f',
        },
      },
    },
  },
  plugins: [],
};
