/** @typedef {import('webpack').Compiler} WebpackCompiler */

const path = require('path');

const minimatch = require('minimatch');
const RawSource = require('webpack-sources/lib/RawSource');

const optimizers = require('./optimizers');

module.exports = class MinifyBundledPlugin {
  constructor({
    patterns,
    exclude = '',
    csso: cssoOpts = {},
    terser: terserOpts = {},
  } = {}) {
    this.optimizerOpts = {
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

  /** @param {WebpackCompiler} compiler */

  apply(compiler) {
    const pluginName = this.constructor.name;

    compiler.hooks.emit.tapPromise(pluginName, compilation => {
      // TODO: an asset may be not in the webpack's compilation
      const assetsPromises = Object.keys(compilation.assets)
        .filter(
          name => !minimatch(name, this.excludePattern)
            && this.patterns.some(pattern => minimatch(name, pattern)),
        )
        .map(async name => {
          const ext = path.extname(name).slice(1);
          const optimizer = optimizers[ext];

          try {
            if (!optimizer) throw new Error(`${pluginName}: no optimizers for '${ext}'`);
            const res = optimizer(
              compilation.assets[name].source().toString(),
              this.optimizerOpts[ext],
            );
            compilation.assets[name] = new RawSource(res);
          } catch (err) {
            compilation.warnings.push(new Error(`${pluginName}: ${err}`));
          }
        });

      return Promise.all(assetsPromises);
    });
  }
};
