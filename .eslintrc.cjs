module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'coverage'],
  parser: '@typescript-eslint/parser',
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unknown-property': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-constant-condition': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-comment-textnodes': 'off',
    'no-empty': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-namespace': 'off'
  },
}
