const path = require('path')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const WebpackPwaManifestPlugin = require('webpack-pwa-manifest')


module.exports = (env, argv) => {
  const environment = argv.mode ? argv.mode : 'development'
  const isProd = environment === 'production'

  let cfg = {
    entry: {
      main: [
        './src/main.js'
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      minimize: isProd,
      nodeEnv: environment,
    },
    plugins: [
      new VueLoaderPlugin(),
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
        template: './src/index.pug',
        title: 'Yayata',
        favicon: './src/assets/img/favicon.ico'
      }),
      new CopyWebpackPlugin([
        {
          from: './src/static'
        }
      ]),
      new webpack.HashedModuleIdsPlugin(),
      new WebpackPwaManifestPlugin({
        name: 'YAYATA',
        short_name: 'YAYATA',
        description: 'Yet Another Timesheet Application... Yet Again',
        background_color: '#9de2d2',
        theme_color: '#50e3c2',
        ios: true,
        icons: [
          {
            src: path.resolve('src/assets/img/logo_pwa.png'),
            sizes: [96, 128, 192, 256, 384, 512]
          }
        ]
      }),
      new WorkboxPlugin.InjectManifest({
        swSrc: path.resolve('src/service-worker.js'),
        swDest: 'service-worker.js',
        exclude: [/\.map$/]
      })
    ],
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: isProd ? '[name].[chunkhash].js' : '[name].[hash].js',
      // filename: isProd ? '[name].js' : '[name].[hash].js',
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: {
            loader: 'vue-loader',
            options: {}
          }
        },
        {
          test: /\.(jade|pug)$/,
          exclude: /node_modules/,
          oneOf: [
            {
              resourceQuery: /^\?vue/,
              use: [{
                loader: 'pug-plain-loader',
                options: {}
              }]
            },
            {
              use: [{
                loader: 'pug-loader',
                options: {}
              }]
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {}
          }
        },
        {
          test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf|otf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash]',
              // name: '[name].[ext]',
            }
          }
        },
        {
          test: /\.json$/,
          exclude: /node_modules/,
          use: {
            loader: 'json-loader',
            options: {}
          }
        },
        {
          test: /\.less$/,
          use: [{
            loader: 'vue-style-loader'
          }, {
            loader: 'css-loader'
          }, {
            loader: 'less-loader'
          }]
        },
        {
          test: /\.css$/,
          use: [{
            loader: 'vue-style-loader'
          }, {
            loader: 'css-loader'
          }]
        }
      ]
    },
    resolve: {
      alias: {
        'vue$': isProd ? 'vue/dist/vue.min' : 'vue/dist/vue'
      }
    },
    devServer: {
      historyApiFallback: true,
      noInfo: true
    },
    devtool: isProd ? 'nosources-source-map' : 'eval-source-map'
  }

  if (!isProd) {
    cfg.plugins = (cfg.plugins || []).concat([
      new BundleAnalyzerPlugin({
        openAnalyzer: false
      })
    ])
  } else {
    // http://vue-loader.vuejs.org/en/workflow/production.html
    cfg.plugins = (cfg.plugins || []).concat([
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ])
  }

  return cfg
}
