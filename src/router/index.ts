import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
// import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import systemRouter from './systemRouter';
import tool from '@/utils/tool';
// import { notification } from '@/utils/message';

// 进度条配置
// NProgress.configure({ showSpinner: false, speed: 500 });

export const routes: Array<RouteRecordRaw> = [
  ...systemRouter
];

// 判断是否已加载过动态/静态路由
const isGetRouter = ref(false);

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path);
  console.log('Current route:', router.currentRoute.value.path);
  // NProgress.start();
  const token = tool.data.get('TOKEN');

  if (to.path === '/login') {
    if (token) {
      next({ path: '/' });
      return false;
    }
    else {
      next();
      return false;
    }
  }
  else {
    if (token) {
      next();
    }
    else {
      next({ path: '/login' });
      return false;
    }
  }
  if (!isGetRouter.value) {
    const apiMenu = tool.data.get('MENU') as MenuItem[] || [];
    const menuRouter = filterAsyncRouter(apiMenu);
    menuRouter.forEach((route: RouteRecordRaw) => {
      console.log(route);
      router.addRoute('layout', route);
    });
    console.log(router.getRoutes());

    next({ ...to, replace: true });
    return false;
  }
});

// router.afterEach(() => {
//   NProgress.done();
// });

// router.onError((error) => {
//   NProgress.done();
//   notification.error({
//     title: '路由错误',
//     description: error.message
//   });
// });

interface MenuItem {
  path: string;
  name: string;
  meta?: {
    type?: string;
    url?: string;
  };
  redirect?: string;
  children?: MenuItem[];
  component?: string;
}

function filterAsyncRouter(routerMap: MenuItem[]): RouteRecordRaw[] {
  const accessedRouters: RouteRecordRaw[] = [];
  routerMap.forEach((item) => {
    item.meta = item.meta || {};
    // 处理外部链接特殊路由
    if (item.meta.type === 'iframe') {
      item.meta.url = item.path;
      item.path = `/i/${item.name}`;
    }
    // 转换为路由对象
    const route: RouteRecordRaw = {
      path: item.path,
      name: item.name,
      meta: item.meta,
      // redirect: item.redirect,
      children: item.children ? filterAsyncRouter(item.children) : [],
      component: loadComponent(item.component)
    };
    accessedRouters.push(route);
  });
  return accessedRouters;
}

const modules = import.meta.glob('/src/views/**/**.vue');

function loadComponent(component: string | undefined) {
  if (component) {
    if (component.includes('/'))
      return modules[`/src/views/${component}.vue`];

    return modules[`/src/views/${component}/index.vue`];
  }
  else {
    return () => import(`/src/views/${component}/index.vue`);
  }
}

export default router;
