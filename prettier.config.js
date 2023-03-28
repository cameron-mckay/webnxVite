// prettier.config.js
module.exports = {
  tailwindConfig: './tailwind.config.cjs',
  tabWidth: 2,
  plugins: [
    require('prettier-plugin-organize-imports'),
    require('prettier-plugin-tailwindcss'),
  ],
};
