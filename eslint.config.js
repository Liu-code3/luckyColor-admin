import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['.vscode', '**/.vscode/**', 'build/*.js', 'build/*.js/**', 'src/assets', 'src/assets/**', 'public', '**/public/**', 'dist', '**/dist/**', 'node_modules', '**/node_modules/**', 'pnpm-lock.yaml', '**/pnpm-lock.yaml/**'],
  formatters: true,
  unocss: true,
  vue: true,
  typescript: true,
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
  },
  rules: {
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-console': 'warn',
  },
})
