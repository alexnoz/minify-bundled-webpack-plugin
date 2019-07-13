const webpack = require('webpack');

const config = require('./webpack.config');
const Plugin = require('../src');

describe('MinifyBundledPlugin', () => {
  let error;

  beforeAll(
    () => new Promise(resolve => {
      webpack(config, err => {
        error = err;
        resolve();
      });
    }),
  );

  describe('compilation', () => {
    test('should compile without errors', () => {
      expect(error).toBe(null);
    });
  });

  test('should throw if `patterns` option was not passed', () => {
    expect(() => new Plugin()).toThrow(/'patterns' is a required option/);
    expect(() => new Plugin({ patterns: '*' })).not.toThrow();
  });
});
