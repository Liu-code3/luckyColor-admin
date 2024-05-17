import antfu from '@antfu/eslint-config';

export default antfu(
  {
    ignores: [
      '.vscode',
      'build/',
      'src/assets',
      'public',
      'dist/',
      'node_modules/',
      'pnpm-lock.yaml',
      '**/*.d.ts'
    ],
    formatters: true,
    unocss: true,
    vue: true,
    typescript: true,
    stylistic: {
      indent: 2, // 4, or 'tab'
      quotes: 'single', // or 'double'
      semi: true // or false
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'off',
      'no-console': 'warn',
      'antfu/if-newline': 'off',
      'style/comma-dangle': ['error', 'never']
    }
  }
);
