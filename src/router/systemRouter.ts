// import config from '@/config';

const routes = [
  {
    path: '/layout',
    name: 'layout',
    component: () => import('../layout/index.vue'),
    children: []
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/login.vue'),
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
