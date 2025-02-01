/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const minimist = require('minimist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const package = require('./package.json');

const argv = minimist(process.argv.slice(2));
const name = argv.name;
console.log(`Start up ${name}`);

function getCssLoaders() {
  return ['style-loader', 'css-loader', 'postcss-loader'];
}

module.exports = {
  mode: 'development',
  entry: [`./${name}.tsx`],
  output: {
    path: path.resolve(__dirname, `static/${name}/dist`),
    filename: 'index.js',
    publicPath: '',
    // library: {
    //   name: "JiraVersion2",
    //   type: "umd",
    //   umdNamedDefine: true,
    // },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'assets'),
    },
    historyApiFallback: true,
    // compress: true,
    port: 9000,
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime', 'styled-jsx/babel'],
          },
        },
      },
      {
        test: /\.tsx?$/,
        // include: [
        //   path.resolve('./static'),
        //   path.resolve(__dirname, '../node_modules/chat-list'),
        // ],
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
        // include: [
        //   path.resolve(
        //     __dirname,
        //     '../packages/chat-list/node_modules/@chatui/core/es/styles/'
        //   ),
        //   path.resolve(__dirname, 'static/_share/assets/css'),
        //   path.resolve(__dirname, '../packages/chat-list/assets/css'),
        // ],
        // exclude: /(node_modules|bower_components)/,
        use: [
          // postcss-loader + less-loader 两个 loader，所以 importLoaders 应该设置为 2
          ...getCssLoaders(2),
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'sass-loader',
            options: { sourceMap: true },
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
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        // include: path.resolve(__dirname, '../packages/chat-list/assets/icon'),
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
    // 'react-is':'ReactIs',
    // 'react-router': 'ReactRouter',
    // 'react-router-dom': 'ReactRouterDOM',
    // 'codemirror': 'CodeMirror',
    // 'highlight.js':'hljs',
    // '@fortawesome/free-solid-svg-icons':'window["free-solid-svg-icons"]',
    // 'react-marked-editor':'MarkedEditor',
    // lodash: '_',
    echarts: 'echarts',
    pdfjsLib: 'pdfjsLib',
    Tesseract: 'Tesseract',
    lunr: 'lunr',
  },
  resolve: {
    mainFields: ['main', 'module'],
    extensions: ['.mock.ts', '.mock.tsx', '.tsx', '.ts', '.js'],
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
      '@api': path.resolve(__dirname, 'api'),
      // 'chat-list': path.resolve(__dirname, '../packages/chat-list'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(package.version),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `./index.html`,
      inject: 'body',
      scriptLoading: 'module',
    }),
    // new BundleAnalyzerPlugin(),

    // new HtmlInlineScriptPlugin(),
  ],
};
