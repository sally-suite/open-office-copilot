/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const package = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");

const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const urlDev = "https://localhost:3001/";
const urlProd = `/${package.name}/`; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

function getCssLoaders() {
  return ["style-loader", "css-loader", "postcss-loader"];
}
const isProd = process.env.NODE_ENV === "production";
const mockExts = isProd ? [] : [".mock.ts", ".mock.tsx"];
module.exports = async (env, options) => {
  console.log(options);
  const dev = options.mode === "development";
  const config = {
    devtool: isProd ? false : "source-map",
    mode: isProd ? "production" : "development",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      // vendor: [],
      sheetchat: ["./src/sheet-chat/index.tsx"],
      slidechat: ["./src/slide-chat/index.tsx"],
      docchat: ["./src/doc-chat/index.tsx"],
      python: ["./src/python/index.tsx"],
      vba: ["./src/vba/index.tsx"],
      // codeedit: ["./src/code-edit/index.tsx"],
      // chartedit: ["./src/chart-edit/index.tsx"],
      // profile: ["./src/profile/index.tsx"],
      commands: "./src/commands/index.tsx",
      doc_commands: "./src/doc-commands/index.tsx",
      functions: "./src/functions/functions.ts",
    },
    output: {
      path: path.resolve(__dirname, `dist`),
      filename: "[name].js",
      publicPath: isProd ? urlProd : urlDev,
      chunkFilename: "[name].[contenthash].js",
      assetModuleFilename: "images/[hash][ext][query]", // 输出的图片文件名
      clean: true,
    },
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: "all",
      },
    },
    externals: {
      react: "React",
      "react-dom": "ReactDOM",
      echarts: "echarts",
      pdfjsLib: "pdfjsLib",
      Tesseract: "Tesseract",
      lunr: "lunr",
      xlsx: "XLSX",
    },
    resolve: {
      mainFields: ["main", "module"],
      extensions: [
        ...mockExts,
        ".excel.tsx",
        ".excel.ts",
        ".word.tsx",
        ".word.ts",
        ".ppt.ts",
        ".ppt.tsx",
        ".tsx",
        ".ts",
        ".js",
        ".md",
      ],
      fallback: {
        os: require.resolve("os-browserify/browser"),
        buffer: false,
        child_process: false,
        path: false,
        assert: false,
        crypto: false,
        url: false,
        http: false,
        https: false,
        querystring: false,
        stream: false,
        fs: false,
        zlib: false,
        tty: false,
        util: false,
        net: false,
        log4js: false,
        "graceful-fs": false,
        constants: false,
        events: false,
        cluster: false,
      },
      alias: {
        "@api": path.resolve(__dirname, "src/_share/api"),
        // '@share': path.resolve(__dirname, 'static/_share'),
        // 'chat-list': path.resolve(__dirname, '../packages/chat-list'),
        "@codemirror/state": "chat-list/node_modules/@codemirror/state",
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: ["@babel/plugin-transform-runtime", "styled-jsx/babel"],
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-typescript", "@babel/preset-react"],
              plugins: ["@babel/plugin-transform-runtime", "styled-jsx/babel"],
            },
          },
        },
        {
          test: /\.css$/,
          use: getCssLoaders(1),
        },
        {
          test: /\.less$/,
          use: [
            // postcss-loader + less-loader 两个 loader，所以 importLoaders 应该设置为 2
            ...getCssLoaders(2),
            {
              loader: "less-loader",
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        // {
        //   test: /\.html$/,
        //   exclude: /node_modules/,
        //   use: "html-loader",
        // },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: "svg-sprite-loader",
              options: {
                symbolId: (filePath) => {
                  return `icon-${path.basename(filePath, ".svg")}`;
                },
              },
            },
            "svg-transform-loader",
            "svgo-loader",
          ],
        },
        {
          test: /\.(md|html|text)$/,
          loader: "raw-loader",
          options: {},
        },
      ],
    },
    plugins: [
      new CustomFunctionsMetadataPlugin({
        output: "functions.json",
        input: "./src/functions/functions.ts",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets",
            to: "assets",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
        ],
      }),
      // new HtmlWebpackPlugin({
      //   filename: "html/code-edit.html",
      //   template: "./src/code-edit/index.html",
      //   chunks: ["codeedit"],
      //   inject: "body",
      // }),
      // new HtmlWebpackPlugin({
      //   filename: "html/chart-edit.html",
      //   template: "./src/chart-edit/index.html",
      //   chunks: ["chartedit"],
      //   inject: "body",
      // }),
      new HtmlWebpackPlugin({
        filename: "sheetchat.html",
        template: "./src/sheet-chat/index.html",
        chunks: ["polyfill", "sheetchat"],
        hash: true,
        inject: "body",
      }),
      new HtmlWebpackPlugin({
        filename: "python.html",
        template: "./src/python/index.html",
        chunks: ["polyfill", "python"],
        hash: true,
        inject: "body",
      }),
      new HtmlWebpackPlugin({
        filename: "vba.html",
        template: "./src/vba/index.html",
        chunks: ["polyfill", "vba"],
        hash: true,
        inject: "body",
      }),
      new HtmlWebpackPlugin({
        filename: "docchat.html",
        template: "./src/doc-chat/index.html",
        chunks: ["polyfill", "docchat"],
        hash: true,
        inject: "body",
      }),
      new HtmlWebpackPlugin({
        filename: "slidechat.html",
        template: "./src/slide-chat/index.html",
        chunks: ["polyfill", "slidechat"],
        hash: true,
        inject: "body",
      }),
      // new HtmlWebpackPlugin({
      //   filename: "profile.html",
      //   template: "./src/profile/index.html",
      //   chunks: ["profile"],
      //   inject: "body",
      // }),
      new HtmlWebpackPlugin({
        filename: "functions.html",
        template: "./src/functions/functions.html",
        chunks: ["polyfill", "functions"],
        hash: true,
      }),
      new HtmlWebpackPlugin({
        filename: "doc-commands.html",
        template: "./src/doc-commands/index.html",
        chunks: ["doc_commands"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/index.html",
        chunks: ["commands"],
      }),
      new FileManagerPlugin({
        events: {
          onEnd: {
            copy: [
              {
                source: path.resolve(__dirname, `dist/`),
                destination: path.resolve(__dirname, `../web-server/public/${package.name}/`),
              },
            ],
          },
        },
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3001,
      // proxy: {
      //   "/api": {
      //     target: "http://127.0.0.1:3000/", // 目标服务器地址
      //     // pathRewrite: { "^/api": "" }, // 重写路径，将请求中的 '/api' 替换为空字符串
      //     changeOrigin: true, // 是否改变源地址
      //     secure: false, // 是否接受 https 请求，如果后端是 https，需要配置为 true
      //   },
      // },
    },
  };

  return config;
};
