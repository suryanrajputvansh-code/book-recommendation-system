/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dbe4fe',
          300: '#bfcefd',
          400: '#9bb0fa',
          500: '#758df6',
          600: '#5368ee',
          700: '#3e4ed9',
          800: '#3440b0',
          900: '#2f398c',
          950: '#1c2154',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
