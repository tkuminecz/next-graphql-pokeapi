const path = require('path');

module.exports = {
  // So parent files don't get applied
  root: true,
  globals: {
    preval: false,
  },
  extends: [
    'airbnb-typescript',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'prettier/react',
    'plugin:prettier/recommended',
  ],
  plugins: ['babel', 'import', 'jest', 'react-hooks', 'jsx-a11y'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: '2019',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
    project: path.resolve(__dirname, './tsconfig.json'),
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    'jest/globals': true,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['~', path.resolve(__dirname, './src')],
          ['~pages', path.resolve(__dirname, './pages')],
          ['~lib', path.resolve(__dirname, './lib')],
        ],
        extensions: ['.ts', '.js', '.jsx', '.tsx', '.png'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    'prefer-object-spread': 'error',
    'no-underscore-dangle': 'off',
    'consistent-this': ['error', 'self'],
    'max-len': [
      'error',
      100,
      2,
      {
        ignoreUrls: true,
      },
    ], // airbnb is allowing some edge cases
    'no-console': ['error', { allow: ['error'] }], // airbnb is using warn

    'react/jsx-fragments': ['error', 'syntax'],
    'react/forbid-prop-types': 'off', // airbnb use error
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ], // airbnb is using .jsx

    // Note, export default interface triggers error for ';', see https://github.com/typescript-eslint/typescript-eslint/issues/123
    'no-extra-semi': 'off',
    semi: ['error', 'always'],

    'jest/valid-expect': 'off', // for jest-expect-message

    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-floating-promises': 'error',

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    'react/prefer-stateless-function': [
      'error',
      { ignorePureComponents: true },
    ],
    'react/jsx-props-no-spreading': 'off',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'prettier/prettier': ['error', { singleQuote: true, arrowParens: 'avoid' }],
    'jsx-a11y/anchor-is-valid': 'off',
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'import/no-cycle': 'off',
    'no-void': 'off',
    'class-methods-use-this': 'off',
    'no-nested-ternary': 'off',
  },
};
