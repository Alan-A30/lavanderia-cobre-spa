/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f0',
          100: '#ffe6d9',
          200: '#ffccb3',
          300: '#ffb38c',
          400: '#ff9966',
          500: '#ff6b35',
          600: '#e85d2e',
          700: '#cc4f27',
          800: '#b34120',
          900: '#993419',
        },
      },
    },
  },
  plugins: [],
}