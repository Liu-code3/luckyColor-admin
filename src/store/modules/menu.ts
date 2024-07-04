import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
import { useIconRender } from '@/hooks/iconRender.ts';
import tool from '@/utils/tool.ts';
import router from '@/router';

interface IMenuState {
  menuOptions: LayoutT.ILastMenu[];
  accessedRouters: RouteRecordRaw[];
  routesAdded: boolean;
}

interface MenuItem {
  path: string;
  name: string;
  component: string;
  meta?: {
    type?: string;
    url?: string;
  };
  redirect?: string;
  children?: MenuItem[];
}

const modules = import.meta.glob('/src/views/**/*.vue');

const iconRender = useIconRender();
export const useMenuStore = defineStore('menu', {
  state: (): IMenuState => ({
    menuOptions: [], // 侧边栏菜单列表
    accessedRouters: [],
    routesAdded: tool.data.get('routeAdd') ?? false
  }),
  actions: {
    /**
     * @description 路由传换为菜单
     */
    transformMenuData(data: LayoutT.MenuItem[]): LayoutT.TransformedMenuItem[] {
      return data.map((item) => {
        const newItem: LayoutT.TransformedMenuItem = {
          pid: item.pid,
          id: item.id,
          label: item.title,
          key: item.path,
          icon: iconRender(item.icon)
        };

        if (item.children && item.children.length) {
          newItem.children = this.transformMenuData(item.children);
        }

        return newItem;
      });
    },
    defaultLoading() {
      const menuData = tool.data.get('MENU') as LayoutT.MenuItem[];
      this.menuOptions = this.transformMenuData(menuData);
    },
    addRoutesWithMenu() {
      const apiMenu = tool.data.get('MENU') as MenuItem[] || [];
      const menuRouter = this.filterAsyncRouter(apiMenu);
      menuRouter.forEach(route => router.addRoute(route));
      this.routesAdded = true;
    },
    filterAsyncRouter(routerMap: MenuItem[]): RouteRecordRaw[] {
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
          children: item.children ? this.filterAsyncRouter(item.children) : [],
          component: this.loadComponent(item.component)
        };
        accessedRouters.push(route);
      });
      this.accessedRouters = [ ...accessedRouters ];
      return accessedRouters;
    },
    loadComponent(component: string) {
      if (component.includes('/')) return modules[`/src/views/${component}.vue`];
      return modules[`/src/views/${component}/index.vue`];
    }
  }
});
