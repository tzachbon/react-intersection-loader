// @ts-check
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type import('webpack').Configuration */
module.exports = {
  context: __dirname,
  entry: {
    main: require.resolve('./src/index.tsx'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {},
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [new HtmlWebpackPlugin()],
};
