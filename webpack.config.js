const path = require('path');

module.exports = {
  entry: {
    App: './app/assets/scripts/app.js',
    Vendor: './app/assets/scripts/Vendor.js'
  },
  output: {
    path: path.resolve(__dirname + './app/temp/scripts'),
    filename: '[name].js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js.|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['es2015', {modules: false}],
          ],
        },
      },
    ],
  },
};