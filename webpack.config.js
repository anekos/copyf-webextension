const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');


const app = {
  entry: {
    popup: './src/js/popup.js',
    manager: './src/js/manager.js',
    content: './src/js/content.js',
    background: './src/js/background.js',
  },
  mode: 'development',
  output: {
    path: `${__dirname}/dist/`,
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'css',
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      {from: 'src/html/*.html', to: 'html/[name].[ext]'},
      {from: 'src/vendor/material-design-icons/MaterialIcons-Regular.woff2', to: 'font'},
      {from: 'src/vendor/material-design-icons/*.png', to: 'icon/[name].[ext]'},
      {from: 'src/meta/manifest.json'},
    ], {}),
    new ZipPlugin({
      path: '../',
      filename: 'copyf.zip'
    }),
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
};

module.exports = [app];
