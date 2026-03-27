import { createI18n } from 'vue-i18n';
import messages from './messages';

export type AppLocale = 'zh-CN' | 'en-US';
export const DEFAULT_LOCALE = 'zh-CN';
export const FALLBACK_LOCALE = 'en-US';
export const LOCALE_STORAGE_KEY = 'APP_LOCALE';
export const LOCALE_OPTIONS: Array<{ value: AppLocale }> = [
  { value: 'zh-CN' },
  { value: 'en-US' }
];
export const LOCALE_LABEL_KEYS: Record<AppLocale, string> = {
  'zh-CN': 'locale.options.zhCN',
  'en-US': 'locale.options.enUS'
};

export function resolveAppLocale(value?: null | string): AppLocale {
  return LOCALE_OPTIONS.some(item => item.value === value)
    ? value as AppLocale
    : DEFAULT_LOCALE;
}

export function getStoredLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  return resolveAppLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
}

export const i18n = createI18n({
  legacy: false,
  locale: getStoredLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  globalInjection: true
});

export function setI18nLanguage(locale: AppLocale) {
  i18n.global.locale.value = locale;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

setI18nLanguage(getStoredLocale());

export default i18n;
