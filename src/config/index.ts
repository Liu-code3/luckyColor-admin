import { DEFAULT_LAYOUT_MODE } from '@/constants/layout';

function readEnvString(value: string | undefined, fallback = '') {
  const normalized = value?.trim();
  return normalized?.length ? normalized : fallback;
}

function readEnvBoolean(value: string | undefined, fallback = false) {
  if (value === undefined)
    return fallback;

  return value.trim().toLowerCase() === 'true';
}

const tenantEnabled = readEnvBoolean(import.meta.env.VITE_TENANT_ENABLED, true);
const apiBaseUrl = readEnvString(import.meta.env.VITE_API_BASEURL, '/api');
const tenantId = tenantEnabled
  ? readEnvString(import.meta.env.VITE_TENANT_ID)
  : '';
const apiDocUrl = readEnvString(import.meta.env.VITE_API_DOC_URL)
  || '/docs';
const defaultUsername = readEnvString(import.meta.env.VITE_APP_DEFAULT_USERNAME, 'admin');
const defaultPassword = readEnvString(import.meta.env.VITE_APP_DEFAULT_PASSWORD, '123456');
const loginCaptchaEnabled = readEnvBoolean(import.meta.env.VITE_LOGIN_CAPTCHA_ENABLED, false);

const DEFAULT_CONFIG = {
  DASHBOARD_URL: '/index',
  API_URL: apiBaseUrl,
  API_DOC_URL: apiDocUrl,
  TIMEOUT: 60000,
  TOKEN_NAME: 'Authorization',
  TOKEN_PREFIX: 'Bearer ',
  TENANT_HEADER_NAME: 'x-tenant-id',
  DEFAULT_TENANT_ID: tenantId,
  HEADERS: tenantEnabled && tenantId
    ? {
        'x-tenant-id': tenantId
      }
    : {},
  REQUEST_CACHE: true,
  LUCK_LAYOUT: DEFAULT_LAYOUT_MODE,
  LUCK_MENU_COLLAPSE: false,
  LUCK_MODULE_UNFOLD_OPEN: true,
  LUCK_LAYOUT_TAGS_OPEN: true,
  LUCK_BREADCRUMD_OPEN: false,
  LUCK_TOP_HEADER_THEME_COLOR_OPEN: true,
  LUCK_TOP_HEADER_THEME_COLOR_SPREAD: true,
  LUCK_SIDE_UNIQUE_OPEN: true,
  LANG: 'zh-cn',
  COLOR: '#0F766E',
  LUCK_THEME: 'light',
  LUCK_FORM_STYLE: 'drawer',
  LOGIN_CAPTCHA_ENABLED: loginCaptchaEnabled,
  TENANT_ENABLED: tenantEnabled,
  DEFAULT_LOGIN_USERNAME: defaultUsername,
  DEFAULT_LOGIN_PASSWORD: defaultPassword,
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222f',
  SYS_BASE_CONFIG: {
    LUCK_SYS_LOGO: '/logo.svg',
    LUCK_SYS_API_URL: apiBaseUrl,
    LUCK_SYS_NAME: 'LuckyColor-admin',
    LUCK_SYS_VERSION: '2.0',
    LUCK_SYS_COPYRIGHT: 'LUCK 漏2022 Created by xiaonuo.vip',
    LUCK_SYS_COPYRIGHT_URL: 'https://www.xiaonuo.vip',
    LUCK_SYS_DEFAULT_FILE_ENGINE: 'LOCAL',
    LUCK_SYS_DEFAULT_CAPTCHA_OPEN: String(loginCaptchaEnabled),
    LUCK_SYS_DEFAULT_PASSWORD: defaultPassword,
    LUCK_SYS_DEFAULT_ACCOUNT: defaultUsername,
    LUCK_SYS_TENANT_OPEN: String(tenantEnabled)
  }
};

export const naiveThemeOverrides = {
  common: {
    primaryColor: '#0F766E',
    primaryColorHover: '#129082',
    primaryColorPressed: '#0B5F5A',
    primaryColorSuppl: '#129082'
  }
};

export default DEFAULT_CONFIG;
