const { GenerateSW } = require("workbox-webpack-plugin");

module.exports = {
  pwa: {
    name: "WebNX",
    themeColor: "#a3e635",
    icons: {
      favicon32: "img/icons/ios/32.png",
      favicon16: "img/icons/ios/16.png",
      appleTouchIcon: "img/icons/ios/152.png",
      maskIcon: "img/icons/maskable.svg",
      msTileImage: "img/icons/ios/144.png",
    },
    workboxPluginMode: "GenerateSW",
  },
  configureWebpack: {
    plugins: [new GenerateSW()],
  },
};
