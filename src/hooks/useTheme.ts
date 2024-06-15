import tool from '@/utils/tool.ts';

const KEY = 'theme';
const localTheme: string | null = tool.data.get(KEY);
const theme = ref(localTheme || 'light');

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
  tool.data.set(KEY, theme.value);
});

export function useTheme() {
  return {
    theme,
    toggleTheme() {
      theme.value = theme.value === 'light' ? 'dark' : 'light';
    }
  };
}
