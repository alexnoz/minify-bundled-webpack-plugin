const path = require('path');

const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CopyPlugin = require('copy-webpack-plugin');

const MinifyBundledPlugin = require('../../src');

const joinDir = path.join.bind(null, __dirname);

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: '.',
  output: {
    path: joinDir('dist'),
    filename: './[name].[chunkhash].js',
  },
  plugins: [
    new CleanPlugin(),
    new CopyPlugin([
      {
        from: joinDir('original/*'),
        to: joinDir('dist/assets'),
        context: 'original',
      },
    ]),
    new MinifyBundledPlugin({
      // exclude: '**/file.js',
      patterns: ['**/assets/*.+(json|css|js)'],
    }),
  ],
};
