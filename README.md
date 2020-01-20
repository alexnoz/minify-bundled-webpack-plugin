# minify-bundled-webpack-plugin
[![Build status](https://travis-ci.org/alexnoz/minify-bundled-webpack-plugin.svg?branch=master)](https://travis-ci.org/alexnoz/minify-bundled-webpack-plugin) [![Current version](https://badgen.net/npm/v/minify-bundled-webpack-plugin)](https://www.npmjs.com/package/minify-bundled-webpack-plugin)
> A simple webpack plugin that minifies assets (`js`, `css`, `json`) that weren't processed by webpack

## What?

Say, you have some `js`, `css` or `json` files in your project which shouldn't be processed by webpack's loaders/plugins, so you copy them from one place to another using [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin). Chances are, you want those files to be minified after you copy them. And that's exactly what this plugin is for! Of course, you can achieve the same thing using the [transform option](https://github.com/webpack-contrib/copy-webpack-plugin#transform) for `copy-webpack-plugin`, but sometimes you simply don't have access to `copy-webpack-plugin`'s options (for example, if you're using [@angular/cli](https://github.com/angular/angular-cli) to build your project).

## Install

Using `yarn`:
```shell
yarn add minify-bundled-webpack-plugin -D
```

Or `npm`:
```shell
npm i minify-bundled-webpack-plugin -D
```

## Usage

```javascript
const CopyPlugin = require('copy-webpack-plugin');
const MinifyBundledPlugin = require('minifiy-bundled-webpack-plugin');

module.exports = {
  mode: 'production',
  context: path.join(__dirname, 'src'),
  entry: './src',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './[name].[chunkhash].js',
  },
  plugins: [
    new CleanPlugin(),
    new CopyPlugin([
      {
        from: path.join(__dirname, 'src/assets/*'),
        to: path.join(__dirname, 'dist/assets'),
        context: 'src',
      },
    ]),
    new MinifyBundledPlugin({
      // Specify the files to minifiy after they're copied
      patterns: ['**/assets/*.+(json|css|js)'],
    }),
    /*
      You can use https://github.com/Klathmon/imagemin-webpack-plugin for minification of 'non-webpack' images
      new ImageminPlugin({ test: /\.(svg|jpe?g|png)$/ })
    */
  ],
};
```

## API

`new MinifyBundledPlugin(options)`

**options**
  ```typescript
  {
    patterns: string[] | string;
    exclude?: string;
    csso?: object;
    terser?: object;
  }
  ```
  * **`patterns`** - required. A glob string or an array of glob strings
  * **`exclude`** - a glob string, all files that match this pattern will not be minified
  * **`csso`** - [csso](https://github.com/css/csso) options
  * **`terser`** - [terser](https://github.com/terser-js/terser#minify-options) options
