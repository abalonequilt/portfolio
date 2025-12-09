const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: [path.resolve(__dirname, '../scripts/game.ts'), path.resolve(__dirname, 'credits.js')],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [{ test: /\.tsx?$|\.jsx?$/, include: path.join(__dirname, '..'), loader: 'ts-loader' }]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: '[name].bundle.js'
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({ gameName: 'My Phaser Game', template: path.resolve(__dirname, '../index.html') }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '../assets'), to: 'assets' },
        { from: path.resolve(__dirname, '../pwa'), to: '' },
        { from: path.resolve(__dirname, '../favicon.ico'), to: '' }
      ]
    })
  ]
}
