/* eslint-disable no-undef */
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const package = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const minimist = require("minimist");

const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const argv = minimist(process.argv.slice(2));
const name = argv.name;

const urlDev = "https://localhost:3001/";
const urlProd = `https://www.sally.bot/${package.name}/${name}/`; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

function getCssLoaders() {
  return ["style-loader", "css-loader", "postcss-loader"];
}

const ExtConfig = {
  "email-chat": [
    ".outlook.tsx",
    ".outlook.ts",
    ".email.tsx",
    ".email.ts",
    ".word.tsx",
    ".word.ts",
    ".doc.tsx",
    ".doc.ts",
    ".office.ts",
    ".office.tsx",
  ],
  "email-read": [
    ".outlook.tsx",
    ".outlook.ts",
    ".email.tsx",
    ".email.ts",
    ".word.tsx",
    ".word.ts",
    ".doc.tsx",
    ".doc.ts",
    ".office.ts",
    ".office.tsx",
  ],
  "email-vsto": [
    ".vsto.tsx",
    ".vsto.ts",
    ".outlook.tsx",
    ".outlook.ts",
    ".email.tsx",
    ".email.ts",
    ".word.tsx",
    ".word.ts",
    ".doc.tsx",
    ".doc.ts",
    ".office.ts",
    ".office.tsx",
  ],
};

const ExtArray = ExtConfig[name] || [];

module.exports = async (env, options) => {
  console.log(options);
  const isProd = options.mode === "production";
  const mockExts = isProd ? [] : [".mock.ts", ".mock.tsx"];

  const config = {
    devtool: isProd ? false : "source-map",
    mode: isProd ? "production" : "development",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      [name]: `./src/${name}/index.tsx`,
    },
    output: {
      path: path.resolve(__dirname, `dist/${name}`),
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
        ...ExtArray,
        // ".excel.tsx",
        // ".excel.ts",
        // ".word.tsx",
        // ".word.ts",
        // ".ppt.ts",
        // ".ppt.tsx",
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
        gapi: false,
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
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(package.version),
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
              if (!isProd) {
                return content.toString().replace(new RegExp(urlDev, "g"), "https://localhost/");
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: `${name}/index.html`,
        template: `src/${name}/index.html`,
        chunks: ["polyfill", name],
        hash: true,
        inject: "body",
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, `dist`),
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
