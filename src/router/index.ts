import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import systemRouter from './systemRouter';
import { useLoading } from '@/utils/nprogress';
import tool from '@/utils/tool';
import { notification } from '@/utils/message';
import { useMenuStore } from '@/store/modules/menu.ts';

// 进度条配置
const { start, done } = useLoading();

export const routes: Array<RouteRecordRaw> = [
  ...systemRouter
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _, next) => {
  start();
  const token = tool.data.get('TOKEN');
  const num: string = tool.data.get('LAST_VIEWS_PATH') as string;

  if (to.path === '/login') {
    if (token) {
      const targetPath = num || '/';
      next({ path: targetPath });
    }
    else {
      next();
    }
  }

  if (!token) {
    next({ path: '/login' });
    return;
  }

  const meunStore = useMenuStore();
  // TODO routesAdded 替换为用户信息来判断
  if (!meunStore.routesAdded) { // 检查是否已经添加了路由
    meunStore.addRoutesWithMenu(); // 确保路由添加完成
    meunStore.routesAdded = true; // 设置标志位，表示路由已经添加
    next({ ...to, replace: true }); // 确保重新导航到目标路径
    return; // 确保每次调用 next 后都立即返回，以避免重复调用。
  }
  next(); // 默认情况继续导航
});

router.afterEach(() => {
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
