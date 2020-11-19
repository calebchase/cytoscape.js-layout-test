const path = require('path');
module.exports = {
  mode: 'development',
  entry: './src/test.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'cytoscape-stickynote',
    libraryTarget: 'umd',
  },
  module: {},
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
  },
};
