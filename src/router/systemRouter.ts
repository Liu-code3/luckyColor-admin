const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/login.vue'),
    meta: {
      title: '登录页'
    }
  }
];

export default routes;
