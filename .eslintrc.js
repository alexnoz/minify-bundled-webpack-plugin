module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 10,
  },
  plugins: ['import', 'node'],
  extends: ['airbnb-base'],
  rules: {
    'node/no-deprecated-api': 2,
    'node/no-extraneous-require': 2,
    'node/no-missing-require': 2,
    'import/no-unresolved': [2, { commonjs: true }],
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'arrow-parens': [2, 'as-needed'],
  },
};
