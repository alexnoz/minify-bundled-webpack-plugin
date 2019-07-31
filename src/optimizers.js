const minifyJson = require('jsonminify');
const imagemin = require('imagemin');
const csso = require('csso');
const terser = require('terser');

exports.image = (opts, source, filepath) => imagemin
  .buffer(source, opts)
  .then(res => (filepath.endsWith('svg') ? res.toString('utf8') : res));

exports.js = async (opts, source) => terser.minify(source.toString('utf8'), opts).code;

exports.css = async (opts, source) => csso.minify(source, opts).css;

exports.json = async source => minifyJson(source.toString('utf8'));
