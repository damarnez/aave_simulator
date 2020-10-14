module.exports = {
  root: true,
  env: {
    es6: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'off',
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'no-useless-return': 'off',
    'import/no-unresolved': 'off',
    'spaced-comment': 'off',
    '@typescript-eslint/camelcase': 'off'
  }
};
