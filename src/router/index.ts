import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import systemRouter from './systemRouter';
import sysConfig from '@/config';
import { useLoading } from '@/utils/nprogress';
import tool from '@/utils/tool';
import { notification } from '@/utils/message';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';

// 进度条配置
const { start, done } = useLoading();

export const routes: Array<RouteRecordRaw> = [
  ...systemRouter
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  start();
  const token = tool.data.get('TOKEN');
  const lastPath: string = tool.data.get('LAST_VIEWS_PATH') as string;

  if (to.path === '/login') {
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
