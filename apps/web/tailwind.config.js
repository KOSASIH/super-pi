/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'spi-gold':  '#F5C518',
        'spi-dark':  '#0A0A0F',
        'spi-green': '#00C896',
      },
    },
  },
  plugins: [],
};
