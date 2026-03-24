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
      whiteList: true,
      guestOnly: true,
      title: '登录页',
      layout: 'empty'
    }
  },
  {
    path: '/icomponent/dict',
    name: 'legacyDictRedirect',
    redirect: '/systemManagement/system/dict'
  },
  {
    path: '/icomponent/editTablist',
    name: 'legacyVxeTableRedirect',
    redirect: '/featureDemo/vxeTable'
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/errorPage/404.vue'),
    meta: {
      whiteList: true,
      title: '404',
      notFound: true,
      layout: 'empty'
    }
  }
];

export default routes;
