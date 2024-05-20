// 获取重定向路径的函数

// 系统路由
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
    path: '/layout',
    name: 'layout',
    component: () => import('../layout/index.vue'),
    children: [
      {
        name: 'index',
        path: '/index',
        component: () => import('../views/index/index.vue'),
        meta: {
          keepAlive: true // 设置需要缓存的组件
        }
      }
    ]
  },
  {
    path: '/iconSelect',
    name: 'iconSelect',
    component: () => import('../components/iconSelect.vue'),
    meta: {
      keepAlive: true // 设置需要缓存的组件
    }
  }
];

export default routes;
