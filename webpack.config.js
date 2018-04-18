const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


const app = {
  entry: {
    popup: './src/js/popup.js',
    manager: './src/js/manager.js',
    content: './src/js/content.js',
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
      {from: 'src/html/popup.html', to: 'html'},
      {from: 'src/html/manager.html', to: 'html'},
      {from: 'src/icon/64.png', to: 'icon'},
      {from: 'src/meta/manifest.json'},
    ], {})
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
};

module.exports = [app];
