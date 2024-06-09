import config from '@/config';

const routes = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/views/layout/index.vue'),
    redirect: config.DASHBOARD_URL,
    children: [

    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      title: '登录页'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    hidden: true,
    component: () => import('../views/errorPage/404.vue')
  }
];

export default routes;
