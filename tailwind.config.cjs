/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  mode: 'jit',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      transitionProperty: {
        height: 'max-height',
      },
    },
    // screens: {
    //   'sm': '576px',
    //   'md': '960px',
    //   'lg': '1440px',
    // },
  },
  plugins: [],
};
