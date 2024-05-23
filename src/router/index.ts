import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import systemRouter from './systemRouter';
import tool from '@/utils/tool';

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
    const menuRouters = flattenMenuList(menuRouter);
    menuRouters.forEach((route: RouteRecordRaw) => {
      console.log(route);
      router.addRoute('layout', route);
    });
    console.log(router.getRoutes());

    next({ ...to, replace: true });
    return false;
  }
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

// 递归扁平化多层级数组
function flattenMenuList(menuList: any[]) {
  return menuList.reduce((acc: any[], item: any) => {
    // 将当前项添加到结果数组中
    acc.push(item);
    // 如果当前项有子项且是数组，则递归调用 flattenMenuList 函数处理子项
    if (Array.isArray(item.children) && item.children.length > 0)
      acc = acc.concat(flattenMenuList(item.children));
    return acc;
  }, []);
}

export default router;
