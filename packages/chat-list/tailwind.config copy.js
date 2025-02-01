/* eslint-disable */

const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      width: {
        card: '280px', // 自定义宽度为 200 像素
      },
      colors: {
        background: 'var(--background)',
        // foreground: 'hsl(var(--foreground))',
        primary: 'var(--brand-1)',
        secondary: 'var(--brand-2)',
        code: '#ededed',
        text: '#333',
        bubble: '#f0f1f5',
      },
    },
  },
  plugins: [],
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
