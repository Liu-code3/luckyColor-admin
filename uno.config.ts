import { defineConfig, presetAttributify, presetUno } from 'unocss';

export default defineConfig({
  presets: [ presetUno(), presetAttributify() ],
  shortcuts: [
    { 'card-border': 'border border-solid border-light_border dark:border-dark_border' },
    { 'auto-bg': 'bg-white dark:bg-dark' },
    { 'auto-bg-hover': 'hover:bg-#eaf0f1 hover:dark:bg-#1b2429' },
    { 'auto-bg-highlight': 'bg-#eaf0f1 dark:bg-#1b2429' },
    { 'text-highlight': 'rounded-4 px-8 py-2 auto-bg-highlight' }
  ],
  rules: [
    [ /^bc-(.+)$/, ([ , color ]) => ({ 'border-color': `#${color}` }) ],
    [ 'card-shadow', { 'box-shadow': '0 1px 2px -2px #00000029, 0 3px 6px #0000001f, 0 5px 12px 4px #00000017' } ]
  ],
  theme: {
    colors: {
      primary: 'rgba(var(--primary-color))',
      dark: '#18181c',
      light_border: '#efeff5',
      dark_border: '#2d2d30'
    }
  }
});
