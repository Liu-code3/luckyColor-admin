import config from '@/config';

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: config.DASHBOARD_URL
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      title: '登录页',
      keepAlive: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    hidden: true,
    component: () => import('../views/errorPage/404.vue')
  }
];

export default routes;
