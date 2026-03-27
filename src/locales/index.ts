import { createI18n } from 'vue-i18n';

export const DEFAULT_LOCALE = 'zh-CN';
export const FALLBACK_LOCALE = 'en-US';

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages: {},
  globalInjection: true
});

export default i18n;
