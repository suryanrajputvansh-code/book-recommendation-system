/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fbfaf7',
          100: '#f7f4ee',
          200: '#ece7de',
          300: '#ddd6ca',
          400: '#c7bfb2',
          500: '#aaa195',
          600: '#8b8378',
          700: '#6c665e',
          800: '#4d4943',
          900: '#2e2c28',
        },

        ink: {
          50: '#f5f4f1',
          100: '#e8e6e1',
          200: '#d3d0ca',
          300: '#b7b3ac',
          400: '#918c84',
          500: '#777269',
          600: '#5d5952',
          700: '#4d4943',
          800: '#34322e',
          900: '#1e1d1a',
        },

        accent: {
          50: '#f7eeee',
          100: '#efe0df',
          200: '#dfc4c3',
          300: '#c99d9c',
          400: '#ad6e70',
          500: '#91484b',
          600: '#7b2f32',
          700: '#652629',
          800: '#512022',
          900: '#3d181a',
        }
      },

      fontFamily: {
        sans: [
          'Lato',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif'
        ],

        serif: [
          '"Playfair Display"',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'serif'
        ]
      },

      boxShadow: {
        none: 'none',

        paper:
          '0 3px 12px rgba(30, 29, 26, 0.07)',

        'paper-lg':
          '0 12px 30px rgba(30, 29, 26, 0.10)',
      },

      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
      }
    },
  },

  plugins: [],
}
