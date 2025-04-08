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
const CopyWebpackPlugin = require('copy-webpack-plugin');

const package = require('./package.json');

const argv = minimist(process.argv.slice(2));
const name = argv.name;
const mock = process.env.MOCK === 'true';

const ExtConfig = {
  'sheet-chat': ['.sheet.tsx', '.sheet.ts'],
  'doc-chat': ['.doc.tsx', '.doc.ts'],
  'sally-chat': ['.chat.tsx', '.chat.ts'],
};

const ExtArray = ExtConfig[name] || [];
const MockArray = mock ? ['.mock.ts', '.mock.tsx'] : [];
console.log(`Start up ${name}`);

function buildMock() {
  const mockFile = `./static/_share/mock/${name}.js`;
  const exist = fs.existsSync(mockFile);
  if (exist) {
    return [mockFile];
  }
  return [];
}

function getCssLoaders() {
  return ['style-loader', 'css-loader', 'postcss-loader'];
}

module.exports = {
  mode: 'development',
  entry: [`./static/${name}/index.tsx`],
  output: {
    path: path.resolve(__dirname, `static/${name}/dist`),
    filename: 'index.js',
    publicPath: `http://localhost:9000/`,
    // library: {
    //   name: "JiraVersion2",
    //   type: "umd",
    //   umdNamedDefine: true,
    // },
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    static: {
      directory: path.join(__dirname, 'static'),
    },
    historyApiFallback: true,
    // compress: true,
    port: 9000,
    hot: true,
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
        test: /\.(md|html|text|txt)$/,
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
    xlsx: 'XLSX',
    gapi: 'gapi',
  },
  resolve: {
    mainFields: ['main', 'module'],
    extensions: [...MockArray, ...ExtArray, '.tsx', '.ts', '.js'],
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
      template: `static/${name}/index.dev.html`,
      inject: 'body',
      scriptLoading: 'module',
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: 'assets',
    //       to: path.resolve(__dirname, `static/${name}/dist/assets`),
    //     },
    //   ],
    // }),
    // new BundleAnalyzerPlugin(),

    // new HtmlInlineScriptPlugin(),
  ],
};
