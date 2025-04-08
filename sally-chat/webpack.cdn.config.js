/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const minimist = require('minimist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const package = require('./package.json');
const isProd = process.env.NODE_ENV === 'production';
const publicPath = isProd ? `` : `http://localhost:3000`;

const argv = minimist(process.argv.slice(2));
const name = argv.name;
const ExtConfig = {
  'sheet-chat': ['.sheet.tsx', '.sheet.ts'],
  'doc-chat': ['.doc.tsx', '.doc.ts'],
  'sally-chat': ['.chat.tsx', '.chat.ts'],
};

const ExtArray = ExtConfig[name] || [];

function getCssLoaders() {
  return ['style-loader', 'css-loader', 'postcss-loader'];
}

module.exports = {
  mode: process.env.NODE_ENV,
  entry: `./static/${name}/index.tsx`,
  output: {
    path: path.resolve(__dirname, `static/${name}/dist`),
    // filename: 'index.js',
    filename: '[name].[contenthash].js',
    publicPath: `${publicPath}/${package.name}/${name}/`,
    chunkFilename: '[id].[contenthash].js',
    assetModuleFilename: 'images/[hash][ext][query]', // 输出的图片文件名
    clean: true,
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'static'),
    },
    // compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: ['@babel/plugin-transform-runtime', 'styled-jsx/babel'],
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
            loader: 'less-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        exclude: path.resolve(
          __dirname,
          '../node_modules/chat-list/assets/icon'
        ),
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: (filePath) => {
                return `icon-${path.basename(filePath, '.svg')}`;
              },
            },
          },
          'svg-transform-loader',
          'svgo-loader',
        ],
      },
      {
        test: /\.(md|html|text)$/,
        loader: 'raw-loader',
        options: {},
      },
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    // 'react-router': 'ReactRouter',
    // 'react-router-dom': 'ReactRouterDOM',
    // 'codemirror': 'CodeMirror',
    // 'highlight.js':'hljs',
    // '@fortawesome/free-solid-svg-icons':'window["free-solid-svg-icons"]',
    // lodash: '_',
    // 'firebase/app': 'firebaseApp',
    // 'firebase/analytics': 'firebaseAnalytics',
    // 'firebase/firestore': 'firebaseFirestore',
    // 'firebase/auth': 'firebaseAuth',
    echarts: 'echarts',
    pdfjsLib: 'pdfjsLib',
    Tesseract: 'Tesseract',
    lunr: 'lunr',
    xlsx: 'XLSX',
    gapi: 'gapi',
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: [...ExtArray, '.tsx', '.ts', '.js'],
    fallback: {
      os: require.resolve('os-browserify/browser'),
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
      'graceful-fs': false,
      constants: false,
      events: false,
      cluster: false,
    },
    alias: {
      '@api': path.resolve(__dirname, 'static/_share/api'),
      '@codemirror/state': 'chat-list/node_modules/@codemirror/state',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(package.version),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `static/${name}/index.html`,
      inject: 'body',
      scriptLoading: 'module',
      templateParameters: {
        hostname: '',
      },
    }),
    // new HtmlInlineScriptPlugin(),
    // new BundleAnalyzerPlugin(),
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: path.resolve(__dirname, `static/${name}/dist/`),
              destination: path.resolve(
                __dirname,
                `../web-server/public/${package.name}/${name}/`
              ),
            },
          ],
        },
      },
    }),
  ],
};
