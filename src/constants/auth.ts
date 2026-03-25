import type { DataScopeType } from './data-scope';

export const AUTH_STORAGE_KEYS = {
  accessToken: 'AUTH_ACCESS_TOKEN',
  userInfo: 'AUTH_USER_INFO',
  menuTree: 'AUTH_MENU_TREE',
  lastViewPath: 'AUTH_LAST_VIEW_PATH',
  lockScreenPassword: 'AUTH_LOCK_SCREEN_PASSWORD',
  tabs: 'AUTH_TABS'
} as const;

export interface LoginSessionPayload {
  accessToken: string;
}

export interface CurrentUserInfo {
  id?: string;
  username: string;
  displayName: string;
  avatar?: string;
  buttonCodeList: string[];
  dataScopeType?: DataScopeType;
  dataScopeDeptIds?: number[];
}

export interface AuthLocalCacheSchema {
  accessToken: string;
  userInfo: CurrentUserInfo;
  menuTree: LayoutT.MenuItem[];
  lastViewPath: string;
  lockScreenPassword: string;
  tabs: LayoutT.ITab[];
}
