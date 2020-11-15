/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const baseManifest = require('./src/manifest.json')

const { env } = process

const DEV = env.NODE_ENV === 'development'

const pkg = {
  author: env.npm_package_author_name,
  description: env.npm_package_description,
  version: env.npm_package_version,
  name: env.npm_package_description,
}
const webpackConfig = {
  mode: env.NODE_ENV,
  entry: { app: './src/index.tsx' },
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [...tsLoader(), staticLoader()],
  },
  plugins: plugins(),
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  optimization: optimization(),
  devtool: env.NODE_ENV === 'development' ? 'eval-source-map' : undefined,
  devServer: {
    writeToDisk: true,
    disableHostCheck: true,
  },
}

function staticLoader() {
  return {
    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
    },
  }
}

function plugins() {
  return [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    }),
    new HtmlWebpackPlugin({
      template: 'popup.html',
      filename: 'popup.html',
    }),
    new WebpackExtensionManifestPlugin({
      config: {
        base: baseManifest,
        extend: pkg,
      },
    }),
    new CopyPlugin({
      patterns: [{ from: 'icon.png' }],
    }),
    DEV && new webpack.HotModuleReplacementPlugin(),
  ].filter(Boolean)
}

function tsLoader() {
  return [
    {
      test: /\.tsx?$/,
      include: path.join(__dirname, 'src'),
      use: [
        {
          loader: 'ts-loader',
          options: {
            configFile: DEV ? 'tsconfig.dev.json' : 'tsconfig.json',
          },
        },
      ],
    },
  ]
}

function optimization() {
  if (DEV) {
    return undefined
  }

  return {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false,
          },
          safari10: true,
        },
      }),
    ],
  }
}

module.exports = webpackConfig
