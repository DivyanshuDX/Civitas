/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          deep: '#1925aa',
          mid: '#2d3abf',
          light: '#4f5bd5',
        },
        cream: {
          DEFAULT: '#e8e6e0',
          dark: '#dddbd5',
          light: '#f2f1ed',
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        'civitas-light': {
          'primary': '#1925aa',
          'primary-content': '#e8e6e0',
          'secondary': '#4f5bd5',
          'secondary-content': '#e8e6e0',
          'accent': '#1925aa',
          'accent-content': '#e8e6e0',
          'neutral': '#2a2a2e',
          'neutral-content': '#e8e6e0',
          'base-100': '#e8e6e0',
          'base-200': '#dddbd5',
          'base-300': '#d0cec8',
          'base-content': '#1a1a1a',
          'info': '#1925aa',
          'success': '#16a34a',
          'warning': '#d97706',
          'error': '#c41230',
        },
      },
      {
        'civitas-dark': {
          'primary': '#818cf8',
          'primary-content': '#1e1e2e',
          'secondary': '#a5b4fc',
          'secondary-content': '#1e1e2e',
          'accent': '#818cf8',
          'accent-content': '#1e1e2e',
          'neutral': '#e8e6e0',
          'neutral-content': '#1e1e2e',
          'base-100': '#1e1e2e',
          'base-200': '#272738',
          'base-300': '#313145',
          'base-content': '#e4e2dc',
          'info': '#818cf8',
          'success': '#34d399',
          'warning': '#fbbf24',
          'error': '#fb7185',
        },
      },
    ],
    logs: false,
  },
  plugins: [require('daisyui')],
}
