var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var DashboardPlugin = require('webpack-dashboard/plugin')

var environment = process.env.NODE_ENV

module.exports = {
  entry: {
    main: [
      './src/main.js'
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // publicPath: '/dist/',
    filename: 'build.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.pug',
      title: 'Yayata',
      favicon: './src/assets/img/favicon.ico'
    }),
    new CopyWebpackPlugin([
      {
        from: './src/static'
      }
    ])
  ],
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
        test: /\.(png|jpg|gif|svg)$/,
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
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': environment === 'production' ? 'vue/dist/vue.min' : 'vue/dist/vue'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  devtool: '#eval-source-map'
}

if (environment !== 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new DashboardPlugin()
  ])
}

if (environment === 'production') {
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
