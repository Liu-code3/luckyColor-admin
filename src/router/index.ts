import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue'),
    meta: {
      keepAlive: true // 设置需要缓存的组件
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
