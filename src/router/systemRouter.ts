const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/login.vue'),
    meta: {
      title: '登录页'
    }
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
    path: '/403',
    name: '403',
    component: () => import('../views/errorPage/403.vue')
  },
  {
    path: '/404',
    name: '404',
    component: () => import('../views/errorPage/404.vue')
  }
];

export default routes;
