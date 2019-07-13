const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const minimatch = require('minimatch');
const csso = require('csso');
const terser = require('terser');
const minifyJson = require('jsonminify');
const imagemin = require('imagemin');
const imageminSvg = require('imagemin-svgo');
const imageminJpg = require('imagemin-jpegtran');
const imageminPng = require('imagemin-pngquant');
const imageminGif = require('imagemin-gifsicle');

const writeFile = promisify(fs.writeFile);

const optimizers = {
  img: (source, opts, filepath) => imagemin
    .buffer(source, opts)
    .then(res => (filepath.endsWith('svg') ? res.toString('utf8') : res)),

  js: async (source, opts) => terser.minify(source.toString('utf8'), opts).code,

  css: async (source, opts) => csso.minify(source, opts).css,

  json: async source => minifyJson(source.toString('utf8')),
};

const imgExtRegEx = /^(jpe?g|png|gif|svg)$/;

module.exports = class MinifyProcessedAssetsPlugin {
  constructor({
    patterns,
    exclude = '',
    jpegtran: jpegtranOpts = {},
    pngquant: pngquantOpts = {},
    svgo: svgoOpts = {},
    gifsicle: gifsicleOpts = {},
    csso: cssoOpts = {},
    terser: terserOpts = {},
  } = {}) {
    this.opts = {
      img: {
        plugins: [
          imageminJpg(jpegtranOpts),
          imageminPng(pngquantOpts),
          imageminSvg(svgoOpts),
          imageminGif(gifsicleOpts),
        ],
      },
      css: cssoOpts,
      js: terserOpts,
    };

    if (patterns === undefined) {
      throw new Error(
        `${this.constructor.name}: 'patterns' is a required option`,
      );
    }

    this.patterns = Array.isArray(patterns) ? patterns : [patterns];
    this.excludePattern = exclude;
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    compiler.hooks.done.tapPromise(pluginName, ({ compilation }) => {
      const outputPath = compilation.outputOptions.path;

      // TODO: an asset may not be in the webpack's compilation
      const assetsPromises = Object.keys(compilation.assets)
        .filter(
          name => !minimatch(name, this.excludePattern)
            && this.patterns.some(pattern => minimatch(name, pattern)),
        )
        .map(name => {
          const filepath = path.join(outputPath, name);
          const ext = path.extname(name).slice(1);

          // TODO: lame, refactor this
          const optimizer = imgExtRegEx.test(ext) ? 'img' : ext;

          return optimizers[optimizer](
            compilation.assets[name].source(),
            this.opts[optimizer],
            filepath,
          )
            .then(res => writeFile(filepath, res))
            .catch(
              err => err.code !== 'ENOENT'
                && compilation.warnings.push(new Error(`${pluginName}: ${err}`)),
            );
        });

      return Promise.all(assetsPromises);
    });
  }
};
