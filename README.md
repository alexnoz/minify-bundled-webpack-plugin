# minify-bundled-webpack-plugin
> A simple webpack plugin that minifies assets (`js`, `css`, `json`) that weren't processed by webpack

## Install

`yarn add minify-bundled-webpack-plugin -D`

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
    new MinifyBundledPlugin({ patterns: ['**/assets/*.+(json|css|js)'] }),
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
