import sysConfig from '@/config';
import { LayoutMode } from '@/constants/layout';

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
      layout: LayoutMode.EMPTY
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
    path: '/tool/codegen/preview',
    name: 'toolCodegenPreview',
    component: () => import('@/views/tool/codegen/preview.vue'),
    meta: {
      title: '代码预览',
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/errorPage/404.vue'),
    meta: {
      whiteList: true,
      title: '404',
      notFound: true,
      layout: LayoutMode.EMPTY
    }
  }
];

export default routes;
