const path = require("path");
module.exports = {
  dest: "public",
  mode: {
    symbol: {
      dest: "css",
      sprite: "sprite.svg", // 输出的精灵文件名
      example: true, // 生成示例页面
    },
    css: {
      dest: "css",
    },
  },
  svg: {
    // 配置 SVG 输入路径
    input: path.join(__dirname, "public/icons"),
  },
};
