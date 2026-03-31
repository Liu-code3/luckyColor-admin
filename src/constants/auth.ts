import type { DataScopeType } from './data-scope';

export const AUTH_STORAGE_KEYS = {
  userInfo: 'AUTH_USER_INFO',
  currentTenant: 'AUTH_CURRENT_TENANT',
  menuTree: 'AUTH_MENU_TREE',
  lastViewPath: 'AUTH_LAST_VIEW_PATH',
  lockScreenPassword: 'AUTH_LOCK_SCREEN_PASSWORD',
  tabs: 'AUTH_TABS'
} as const;

export interface LoginSessionPayload {
  accessToken: string;
}

export type TenantContextSource = 'env' | 'login' | 'profile' | 'switch';

export interface TenantContextInfo {
  tenantId: string;
  tenantName?: string | null;
  tenantCode?: string | null;
  source?: TenantContextSource;
}

export interface CurrentUserInfo {
  id?: string;
  tenantId?: string;
  tenantName?: string | null;
  username: string;
  displayName: string;
  avatar?: string;
  roleCodes?: string[];
  buttonCodeList: string[];
  dataScopeType?: DataScopeType;
  dataScopeDeptIds?: number[];
}

export interface AuthLocalCacheSchema {
  userInfo: CurrentUserInfo;
  currentTenant: TenantContextInfo;
  menuTree: LayoutT.MenuItem[];
  lastViewPath: string;
  lockScreenPassword: string;
  tabs: LayoutT.ITab[];
}
