var webpack = require('webpack');

module.exports = {
  entry: './entry.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js']
  }
};
