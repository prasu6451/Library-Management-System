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
        },
        'gray-1000': 'var(--ds-gray-1000)',
        'gray-alpha-400': 'var(--ds-gray-alpha-400)',
        'background-100': 'var(--ds-background-100)',
        'background-200': 'var(--ds-background-200)',
        'background-200-alpha-800': 'var(--ds-background-200-alpha-800)',
        'accents-1': 'var(--accents-1)',
        'accents-2': 'var(--accents-2)',
        'overlay': 'var(--ds-overlay)'
      },
      boxShadow: {
        'border': 'var(--ds-shadow-border)',
        'border-small': 'var(--ds-shadow-border-small)',
        'border-medium': 'var(--ds-shadow-border-medium)',
        'border-large': 'var(--ds-shadow-border-large)',
        'tooltip': 'var(--ds-shadow-tooltip)',
        'menu': 'var(--ds-shadow-menu)',
        'modal': 'var(--ds-shadow-modal)',
        'fullscreen': 'var(--ds-shadow-fullscreen)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
