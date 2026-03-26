import { getMenuTreeApi, getProfileApi } from '@/api';
import {
  getCurrentUserInfo,
  setCurrentTenantContext,
  setCurrentUserInfo
} from '@/utils/auth';
import { resolveSessionButtonCodeList } from '@/utils/permission';

interface MenuStoreLike {
  getCachedMenuTree: () => LayoutT.MenuItem[];
  cacheMenuTree: (menuData: LayoutT.MenuItem[]) => void;
}

let authBootstrapPromise: Promise<void> | null = null;

async function bootstrapAuthState(menuStore: MenuStoreLike) {
  const tasks: Promise<unknown>[] = [];

  if (!getCurrentUserInfo()) {
    tasks.push(
      getProfileApi().then(({ data }) => {
        setCurrentTenantContext({
          tenantId: data.tenantId,
          tenantName: data.tenantName ?? null,
          source: 'profile'
        });
        setCurrentUserInfo({
          id: data.id,
          tenantId: data.tenantId,
          tenantName: data.tenantName ?? null,
          username: data.username,
          displayName: data.nickname || data.username,
          roleCodes: data.roleCodes || undefined,
          buttonCodeList: resolveSessionButtonCodeList(data.username, data),
          dataScopeType: data.dataScopeType || undefined,
          dataScopeDeptIds: data.dataScopeDeptIds || undefined
        });
      })
    );
  }

  if (!menuStore.getCachedMenuTree().length) {
    tasks.push(
      getMenuTreeApi().then(({ data }) => {
        menuStore.cacheMenuTree(data);
      })
    );
  }

  await Promise.all(tasks);
}

export function ensureAuthState(menuStore: MenuStoreLike) {
  if (!authBootstrapPromise) {
    authBootstrapPromise = bootstrapAuthState(menuStore).finally(() => {
      authBootstrapPromise = null;
    });
  }

  return authBootstrapPromise;
}
