import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
