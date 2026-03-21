export const AUTH_STORAGE_KEYS = {
  accessToken: 'AUTH_ACCESS_TOKEN',
  menuTree: 'AUTH_MENU_TREE',
  lastViewPath: 'AUTH_LAST_VIEW_PATH',
  lockScreenPassword: 'AUTH_LOCK_SCREEN_PASSWORD',
  tabs: 'AUTH_TABS'
} as const;

export interface LoginSessionPayload {
  accessToken: string;
}

export interface AuthLocalCacheSchema {
  accessToken: string;
  menuTree: LayoutT.MenuItem[];
  lastViewPath: string;
  lockScreenPassword: string;
  tabs: LayoutT.ITab[];
}
