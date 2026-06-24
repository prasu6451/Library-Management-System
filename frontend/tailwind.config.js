/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#e4e8f0',
          200: '#c8d1e2',
          300: '#9fb0cd',
          400: '#708ab3',
          500: '#4e6d9b',
          600: '#3c557d',
          700: '#324566',
          800: '#2b3a55',
          900: '#243046',
          950: '#182030',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
