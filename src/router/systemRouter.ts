import sysConfig from '@/config';

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: sysConfig.DASHBOARD_URL
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      title: '登录页',
      layout: 'empty'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/errorPage/404.vue'),
    meta: {
      layout: 'empty'
    }
  }
];

export default routes;
