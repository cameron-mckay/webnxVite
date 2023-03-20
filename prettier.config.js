// prettier.config.js
module.exports = {
  tailwindConfig: "./tailwind.config.cjs",
  plugins: [
    require("prettier-plugin-organize-imports"),
    require("prettier-plugin-tailwindcss"),
  ],
};
