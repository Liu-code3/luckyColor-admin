import config from '@/config';

const routes = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/views/layout/index.vue'),
    redirect: config.DASHBOARD_URL,
    children: [
      {
        path: 'index',
        name: 'index',
        component: () => import('@/views/index/index.vue'),
        meta: {
          title: '首页'
        }
      }
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
    path: '/403',
    name: '403',
    component: () => import('@/views/errorPage/403.vue')
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/errorPage/404.vue')
  }
];

export default routes;
