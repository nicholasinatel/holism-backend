module.exports = {
  env: {
    browser: false,
    es6: true
  },
  extends: ['airbnb-base', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    indent: [0, 1],
    'comma-dangle': ['error', 'only-multiline']
  }
};
