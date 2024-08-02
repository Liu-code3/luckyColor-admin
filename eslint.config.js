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
    typescript: true,
    vue: {
      overrides: {
        'vue/v-on-event-hyphenation': 'off',
        'vue/prefer-separate-static-class': 'off'
      }
    },
    stylistic: {
      indent: 2, // 4, or 'tab'
      quotes: 'single', // or 'double'
      semi: true // or false
    },
    rules: {
      'no-undef': 'off',
      'no-console': 'warn',
      'antfu/if-newline': 'off',
      'style/comma-dangle': [ 'error', 'never' ],
      'style/array-bracket-spacing': [ 'error', 'always' ],
      'antfu/top-level-function': 'off',
      'style/quote-props': 'off'
    }
  }
);
