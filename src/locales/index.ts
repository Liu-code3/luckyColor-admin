import { createI18n } from 'vue-i18n';
import messages from './messages';

export type AppLocale = 'zh-CN' | 'en-US';
export const DEFAULT_LOCALE = 'zh-CN';
export const FALLBACK_LOCALE = 'en-US';
export const LOCALE_OPTIONS: Array<{ value: AppLocale }> = [
  { value: 'zh-CN' },
  { value: 'en-US' }
];
export const LOCALE_LABEL_KEYS: Record<AppLocale, string> = {
  'zh-CN': 'locale.options.zhCN',
  'en-US': 'locale.options.enUS'
};

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
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

setI18nLanguage(DEFAULT_LOCALE);

export default i18n;
