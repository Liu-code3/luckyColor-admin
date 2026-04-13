import type { RouteLocationMatched, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import systemRouter from './systemRouter';
import sysConfig from '@/config';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import { getAccessToken, initializeAuthSession } from '@/utils/auth';
import { useLoading } from '@/utils/nprogress';
import { syncDashboardVisit } from '@/utils/dashboard-tracker';
import tool from '@/utils/tool';
import { notification } from '@/utils/message';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';
import { ensureAuthState } from '@/utils/auth-bootstrap';
import { ensureAccessToken } from '@/utils/http/session.ts';

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
  if (ROUTE_WHITE_LIST.includes(path))
    return true;
  return matchedRoutes.some(route => Boolean(route.meta?.whiteList));
}

function shouldRedirectAuthenticatedWhiteListRoute(
  path: string,
  matchedRoutes: RouteLocationMatched[]
) {
  if (ROUTE_WHITE_LIST.includes(path)) {
    return path === '/login';
  }

  return matchedRoutes.some(route => Boolean(route.meta?.whiteList && route.meta?.guestOnly));
}

function shouldTrackAsTab(path: string, matchedRoutes: RouteLocationMatched[]) {
  if (EXCLUDE_TAB.includes(path)) {
    return false;
  }

  return !matchedRoutes.some(route => route.meta?.layout === 'empty');
}

function isNotFoundFallbackRoute(matchedRoutes: RouteLocationMatched[]) {
  return matchedRoutes.some(route => Boolean(route.meta?.notFound));
}

function isDashboardFallbackRoute(path: string, matchedRoutes: RouteLocationMatched[]) {
  return path === sysConfig.DASHBOARD_URL && isNotFoundFallbackRoute(matchedRoutes);
}

function buildRetryNavigationTarget(fullPath: string) {
  return {
    path: fullPath,
    replace: true
  };
}

function shouldRestoreLastVisitedPath(
  to: RouteLocationNormalized,
  lastPath: string
) {
  return Boolean(
    lastPath
    && lastPath !== sysConfig.DASHBOARD_URL
    && to.path === sysConfig.DASHBOARD_URL
    && to.redirectedFrom?.path === '/'
  );
}

router.beforeEach(async (to) => {
  start();
  initializeAuthSession();
  let token = getAccessToken();
  const lastPath: string = tool.data.get(AUTH_STORAGE_KEYS.lastViewPath) as string;
  const whiteListed = isWhiteListRoute(to.path, to.matched);
  const notFoundFallback = isNotFoundFallbackRoute(to.matched);
  const dashboardFallback = isDashboardFallbackRoute(to.path, to.matched);

  if (whiteListed && !notFoundFallback) {
    if (token && shouldRedirectAuthenticatedWhiteListRoute(to.path, to.matched)) {
      const targetPath = lastPath || '/';
      return { path: targetPath, replace: true };
    }
    return true;
  }

  if (!token) {
    token = await ensureAccessToken();
  }

  if (!token) {
    if (dashboardFallback) {
      return { path: '/login', replace: true };
    }

    if (whiteListed && notFoundFallback) {
      return true;
    }

    return { path: '/login', replace: true };
  }

  const menuStore = useMenuStore();
  try {
    await ensureAuthState(menuStore);
  }
  catch {
    return false;
  }

  if (!menuStore.hasDynamicRoutes()) {
    const restored = menuStore.restoreRoutesFromCache();
    if (restored) {
      return buildRetryNavigationTarget(to.fullPath);
    }
  }

  if (shouldRestoreLastVisitedPath(to, lastPath)) {
    return { path: lastPath, replace: true };
  }
});

export const EXCLUDE_TAB = [ '/login' ];

router.afterEach((to) => {
  if (!shouldTrackAsTab(to.path, to.matched)) {
    syncDashboardVisit(to);
    done();
    return;
  }

  const tab: LayoutT.ITab = {
    label: to.meta.title as string,
    key: to.path,
    layout: to.meta.layout as string
  };
  const tabStore = useTabStore();
  tabStore.addTab(tab);
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
