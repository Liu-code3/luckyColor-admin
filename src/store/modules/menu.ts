import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import { useIconRender } from '@/hooks/iconRender.ts';
import { normalizeMenuTree } from '@/utils/menu-normalizer';
import tool from '@/utils/tool.ts';
import router from '@/router';
import config from '@/config/index';

interface IMenuState {
  menuOptions: LayoutT.TransformedMenuItem[] | [];
  switchModulesList: LayoutT.TransformedMenuItem[];
  accessedRouters: RouteRecordRaw[];
  collapsed: boolean;
}

const modules = import.meta.glob('/src/views/**/*.vue');
const iconRender = useIconRender();
export const useMenuStore = defineStore('menu', {
  state: (): IMenuState => ({
    menuOptions: [], // 侧边栏菜单列表
    switchModulesList: [], // 模块
    accessedRouters: [], // 权限路由列表
    collapsed: false
  }),
  actions: {
    /**
     * @description 路由传换为菜单
     */
    transformMenuData(data: LayoutT.MenuItem[]): LayoutT.TransformedMenuItem[] {
      return data.map((item: LayoutT.MenuItem) => {
        const newItem: LayoutT.TransformedMenuItem = {
          type: item.type,
          layout: item.layout,
          key: item.path,
          label: item.title,
          icon: iconRender(item.icon)
        };

        if (item.children && item.children.length) {
          newItem.children = this.transformMenuData(item.children);
        }

        return newItem;
      });
    },
    defaultLoading() {
      const menuData = this.getCachedMenuTree();
      this.switchModulesList = this.transformMenuData(menuData);
      if (config.LUCK_LAYOUT === 'modular') return;
      this.menuOptions = this.transformMenuData(menuData);
    },
    getCachedMenuTree() {
      const cachedMenuTree = normalizeMenuTree(
        tool.data.get(AUTH_STORAGE_KEYS.menuTree) as LayoutT.MenuItem[] || []
      );
      tool.data.set(AUTH_STORAGE_KEYS.menuTree, cachedMenuTree);
      return cachedMenuTree;
    },
    cacheMenuTree(menuData: LayoutT.MenuItem[]) {
      tool.data.set(AUTH_STORAGE_KEYS.menuTree, normalizeMenuTree(menuData));
    },
    initializeRoutesWithMenu(menuData: LayoutT.MenuItem[]) {
      this.cacheMenuTree(menuData);
      return this.addRoutesWithMenu(menuData);
    },
    addRoutesWithMenu(menuData: LayoutT.MenuItem[] = this.getCachedMenuTree()) {
      const apiMenu = menuData || [];
      const menuRouter = this.filterAsyncRouter(apiMenu);
      menuRouter.forEach(route => router.addRoute(route));
      return menuRouter;
    },
    filterAsyncRouter(routerMap: LayoutT.MenuItem[]): RouteRecordRaw[] {
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
          meta: {
            ...item.meta,
            title: item.title,
            icon: item.icon
          },
          redirect: item?.redirect,
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
