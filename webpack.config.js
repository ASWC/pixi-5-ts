const path = require('path')

module.exports = {
  entry: './js-compile/index.js',
  devtool: "inline-source-map",
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'bin')
  },
  module:{
    rules:
    [
      {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  }
  
}