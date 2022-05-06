// @ts-check
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type import('webpack').Configuration */
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  context: __dirname,
  entry: {
    main: require.resolve('./src/main.tsx'),
    index: require.resolve('./src/index.tsx'),
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: 'globalThis',
  },
  externals: {
    react: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React',
    },
    'react-dom': {
      amd: 'react-dom',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      root: 'ReactDOM',
    },
  },
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
        options: {
          compilerOptions: {
            module: 'esnext',
          },
        },
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
