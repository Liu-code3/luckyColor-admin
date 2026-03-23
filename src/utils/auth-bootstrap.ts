import { getMenuTreeApi, getProfileApi } from '@/api';
import { getCurrentUserInfo, setCurrentUserInfo } from '@/utils/auth';
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
        setCurrentUserInfo({
          username: data.username,
          displayName: data.nickname || data.username,
          buttonCodeList: resolveSessionButtonCodeList(data.username, data)
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
