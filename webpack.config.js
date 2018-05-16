const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const WebpackPwaManifestPlugin = require('webpack-pwa-manifest')


const environment = process.env.NODE_ENV
const isProd = environment === 'production'


module.exports = {
  entry: {
    main: [
      './src/main.js'
    ],
    vendor: [
      'lodash',
      'moment',
      'moment-timezone',
      'file-saver',
      'toastr',
      'pikaday',
      'vue',
      'vue-router',
      'vue-resource',
      'vue-moment',
      'vue-markdown',
      'vue-multiselect',
      'vue-form-generator',
      'vue-tables-2',
      'vue-js-toggle-button',
      'vue-progressbar',
      'vuex',
      'vuex-persistedstate',
      'vuex-router-sync',
      'bootstrap-vue',
    ]
  },
  plugins: [
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
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new WorkboxPlugin.GenerateSW(),
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
    })
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: isProd ? '[name].[chunkhash].js' : '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // vue-loader options go here
        }
      },
      {
        test: /\.(jade|pug)$/,
        loader: 'pug-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
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
  devtool: '#eval-source-map'
}

if (!isProd) {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new BundleAnalyzerPlugin({
      openAnalyzer: false
    })
  ])
} else {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
