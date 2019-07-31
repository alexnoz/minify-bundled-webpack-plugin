const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const webpack = require('webpack');

const config = require('./fixtures/webpack.config');
const MinifyBundledPlugin = require('../src');

const readFile = promisify(fs.readFile);

describe('MinifyBundledPlugin', () => {
  describe('compilation', () => {
    let error;

    beforeAll(
      () => new Promise(resolve => {
        webpack(config, err => {
          error = err;
          resolve();
        });
      }),
    );

    test('should compile without errors', () => {
      expect(error).toBe(null);
    });

    test('should minify assets', async () => {
      const filenames = fs.readdirSync(
        path.join(__dirname, './fixtures/minified'),
      );
      const promises = filenames.map(name => Promise.all([
        readFile(path.join(__dirname, `./fixtures/minified/${name}`)),
        readFile(path.join(__dirname, `./fixtures/dist/assets/${name}`)),
      ]),
      );
      for (const [expected, actual] of await Promise.all(promises)) {
        expect(actual).toEqual(expected);
      }
    });
  });

  test('should throw if `patterns` option was not passed', () => {
    expect(() => new MinifyBundledPlugin()).toThrow(
      /'patterns' is a required option/,
    );
    expect(() => new MinifyBundledPlugin({ patterns: '*' })).not.toThrow();
  });
});
