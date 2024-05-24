import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import systemRouter from './systemRouter';
import { useLoading } from '@/utils/nprogress';
import tool from '@/utils/tool';
import { notification } from '@/utils/message';

// 进度条配置
const { start, done } = useLoading();

export const routes: Array<RouteRecordRaw> = [
  ...systemRouter
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  start();
  const token = tool.data.get('TOKEN');
  if (to.path === '/login') {
    if (token)
      next({ path: '/layout' });
    else
      next();
  }
  else {
    if (token)
      next();
    else
      next({ path: '/login' });
  }
});

router.afterEach(() => {
  done();
});

router.onError((error) => {
  done();
  notification.error({
    title: '路由错误',
    description: error.message
  });
});

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

export function addRoutesWithMenu() {
  const apiMenu = tool.data.get('MENU') as MenuItem[] || [];
  const menuRouter = filterAsyncRouter(apiMenu);
  menuRouter.forEach((route) => {
    router.addRoute('layout', route);
  });
}

const modules = import.meta.glob('/src/views/**/**.vue');

function loadComponent(component: string | undefined) {
  // if (!component)
  //   return () => import(/* @vite-ignore */ `/src/views/${component}/index.vue`);

  // const path = component.includes('/')
  //   ? `/src/views/${component}.vue`
  //   : `/src/views/${component}/index.vue`;

  // return modules[path] || (() => import(/* @vite-ignore */ path));

  if (component) {
    if (component.includes('/')) {
      console.log('222222222');
      return modules[`/src/views/${component}.vue`];
    }
    return modules[`/src/views/${component}/index.vue`];
  }
  else {
    return () => import(/* @vite-ignore */ `/src/views/${component}/index.vue`);
  }
}

export default router;
