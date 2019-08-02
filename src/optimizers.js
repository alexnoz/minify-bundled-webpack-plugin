const minifyJson = require('jsonminify');
const csso = require('csso');
const terser = require('terser');

exports.js = (source, opts) => terser.minify(source, opts).code;

exports.css = (source, opts) => csso.minify(source, opts).css;

exports.json = minifyJson;
