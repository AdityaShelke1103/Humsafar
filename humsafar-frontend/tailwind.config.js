/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f4ecd9',
          300: '#ebdcbb',
        },
        ink: {
          50: '#eef2f7',
          100: '#d9e2ec',
          200: '#b3c2d4',
          300: '#829ab1',
          400: '#54718d',
          500: '#385571',
          600: '#2b4359',
          700: '#1f3245',
          800: '#142236',
          900: '#0a1525',
        },
        saffron: {
          50: '#fff8ed',
          100: '#ffeed3',
          200: '#ffd9a5',
          300: '#ffbd6e',
          400: '#ff9a32',
          500: '#f97d06',
          600: '#dd6400',
          700: '#b74b02',
          800: '#923906',
          900: '#783008',
        },
        teal: {
          50: '#effcf6',
          100: '#c8f7e7',
          200: '#90edd4',
          300: '#52ddb9',
          400: '#28c39c',
          500: '#13a782',
          600: '#0c8568',
          700: '#0a6a54',
          800: '#0a5445',
          900: '#094539',
        },
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'draw-path': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        float: 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.34s ease-out forwards',
        'draw-path': 'draw-path 0.38s ease-out forwards',
      },
    },
  },
  plugins: [],
};
