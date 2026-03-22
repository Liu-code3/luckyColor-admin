import type { RouteLocationMatched, RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import systemRouter from './systemRouter';
import sysConfig from '@/config';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import { getAccessToken } from '@/utils/auth';
import { useLoading } from '@/utils/nprogress';
import { syncDashboardVisit } from '@/utils/dashboard-tracker';
import tool from '@/utils/tool';
import { notification } from '@/utils/message';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';
import { ensureAuthState } from '@/utils/auth-bootstrap';

// 进度条配置
const { start, done } = useLoading();
const ROUTE_WHITE_LIST = [ '/login' ];

export const routes: Array<RouteRecordRaw> = [
  ...systemRouter
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

function isWhiteListRoute(path: string, matchedRoutes: RouteLocationMatched[]) {
  if (ROUTE_WHITE_LIST.includes(path)) return true;
  return matchedRoutes.some(route => Boolean(route.meta?.whiteList));
}

router.beforeEach(async (to) => {
  start();
  const token = getAccessToken();
  const lastPath: string = tool.data.get(AUTH_STORAGE_KEYS.lastViewPath) as string;
  const whiteListed = isWhiteListRoute(to.path, to.matched);

  if (whiteListed) {
    if (token) {
      const targetPath = lastPath || '/';
      return ({ path: targetPath, replace: true });
    }
    return true;
  }

  if (!token) {
    return ({ path: '/login', replace: true });
  }

  // 防止动态路由刷新丢失
  const menuStore = useMenuStore();
  try {
    await ensureAuthState(menuStore);
  }
  catch {
    return false;
  }

  if (!menuStore.accessedRouters.length) {
    menuStore.addRoutesWithMenu(); // 确保路由添加完成
    return ({ ...to, replace: true }); // 确保重新导航到目标路径
  }

  // 保留上一次关闭系统时候的路由界面
  if (to.path === sysConfig.DASHBOARD_URL && lastPath) {
    if (sysConfig.DASHBOARD_URL === lastPath) {
      return true;
    }
    else {
      return ({ path: lastPath, replace: true });
    }
  }
});

export const EXCLUDE_TAB = [ '/login' ];
router.afterEach((to) => {
  // 刚登入系统时 添加tab
  const tab: LayoutT.ITab = {
    label: to.meta.title as string,
    key: to.path,
    layout: to.meta.layout as string
  };
  const tabStore = useTabStore();
  !(EXCLUDE_TAB.includes(to.path)) && tabStore.addTab(tab);
  syncDashboardVisit(to);
  done();
});

router.onError((error) => {
  done();
  notification.error({
    title: '路由错误',
    description: error.message
  });
});

export default router;
