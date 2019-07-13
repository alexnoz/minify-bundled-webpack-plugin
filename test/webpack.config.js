const path = require('path');

const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MinifyBundledPlugin = require('../src');

const joinDir = path.join.bind(null, __dirname);

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './fixtures',
  output: {
    path: joinDir('dist'),
    filename: './[name].[chunkhash].js',
  },
  plugins: [
    new CleanPlugin(),
    new CopyPlugin([
      {
        from: joinDir('fixtures/assets/*'),
        to: joinDir('dist'),
        context: 'fixtures/',
      },
    ]),
    new MinifyBundledPlugin({
      exclude: '**/file.js',
      patterns: ['**/assets/*.+(svg|jpg|json|css|js)'],
      csso: {},

      terser: {},

      jpegtran: {
        progressive: true,
      },

      svgo: {
        plugins: [{ removeViewBox: false }],
      },

      pngquant: {},
    }),
  ],
};
