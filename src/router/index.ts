import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import systemRouter from './systemRouter';
import contentRouting from './contentRouting';
import tool from '@/utils/tool';

export const routes: Array<RouteRecordRaw> = [
  ...systemRouter,
  ...contentRouting
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = tool.data.get('TOKEN');
  if (to.path === '/login') {
    if (token) {
      next({
        path: '/layout'
      });
    }
    else {
      next();
    }
  }
  else {
    if (token) {
      next();
    }
    else {
      next({
        path: '/login'
      });
    }
  }
});
export default router;
