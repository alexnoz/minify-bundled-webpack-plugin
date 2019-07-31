const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const minimatch = require('minimatch');
const imageminSvg = require('imagemin-svgo');
const imageminJpg = require('imagemin-jpegtran');
const imageminPng = require('imagemin-pngquant');
const imageminGif = require('imagemin-gifsicle');

const optimizers = require('./optimizers');

const writeFile = promisify(fs.writeFile);

const imgOptimizer = 'imagemin';
const jsOptimizer = 'terser';
const cssOptimizer = 'csso';
const jsonOptimizer = 'minifyJson';

const extOptimizerMap = new Map([
  [/^(jpe?g|png|gif|svg)$/, imgOptimizer],
  [/^js$/, jsOptimizer],
  [/^css$/, cssOptimizer],
  [/^json$/, jsonOptimizer],
]);

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
    this.optimizers = {
      [imgOptimizer]: optimizers.image.bind(null, {
        plugins: [
          imageminJpg(jpegtranOpts),
          imageminPng(pngquantOpts),
          imageminSvg(svgoOpts),
          imageminGif(gifsicleOpts),
        ],
      }),
      [cssOptimizer]: optimizers.css.bind(null, cssoOpts),
      [jsOptimizer]: optimizers.js.bind(null, terserOpts),
      [jsonOptimizer]: optimizers.json,
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

          const [optimizerName] = [...extOptimizerMap.keys()]
            .filter(re => re.test(ext))
            .map(re => extOptimizerMap.get(re));

          return this.optimizers[optimizerName](
            compilation.assets[name].source(),
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
