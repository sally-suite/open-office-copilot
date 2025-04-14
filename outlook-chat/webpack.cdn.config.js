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
const urlProd = `{hostname}/${package.name}/`; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION
const publicPath = `/${package.name}/${name}/`; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

function getCssLoaders() {
  return ["style-loader", "css-loader", "postcss-loader"];
}
const isProd = process.env.NODE_ENV === "production";

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

const mockExts = isProd ? [] : [".mock.ts", ".mock.tsx"];
const ExtArray = ExtConfig[name] || [];

module.exports = async (env, options) => {
  const isProd = options.mode === "production";

  const config = {
    devtool: isProd ? false : "source-map",
    mode: isProd ? "production" : "development",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      [name]: `./src/${name}/index.tsx`,
    },
    output: {
      path: path.resolve(__dirname, `dist/${name}`),
      filename: "[name].[contenthash].js",
      publicPath: isProd ? publicPath : urlDev,
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
      extensions: [...ExtArray, ".tsx", ".ts", ".js", ".md"],
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
            from: path.resolve(__dirname, "assets"),
            to: path.resolve(__dirname, "dist/assets"),
          },
          {
            from: "manifest*.xml",
            to: path.resolve(__dirname, "dist/[name]" + "[ext]"),
            transform(content) {
              if (!isProd) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: `index.html`,
        template: `src/${name}/index.html`,
        chunks: ["polyfill", name],
        hash: true,
        inject: "body",
      }),
      new FileManagerPlugin({
        events: {
          onEnd: {
            copy: [
              {
                source: path.resolve(__dirname, `dist/${name}/`),
                destination: path.resolve(__dirname, `../web-server/public/${package.name}/${name}/`),
              },
            ],
          },
        },
      }),
    ],
  };

  return config;
};
