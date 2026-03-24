import { defineStore } from 'pinia';
import { defineAsyncComponent, markRaw } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import { useIconRender } from '@/hooks/iconRender.ts';
import { normalizeMenuTree } from '@/utils/menu-normalizer';
import tool from '@/utils/tool.ts';
import router from '@/router';
import { useGlobalStore } from './global';

interface IMenuState {
  menuOptions: LayoutT.TransformedMenuItem[] | [];
  switchModulesList: LayoutT.TransformedMenuItem[];
  accessedRouters: RouteRecordRaw[];
  dynamicRouteNames: string[];
  collapsed: boolean;
}

const modules = import.meta.glob('/src/views/**/*.vue');
const iconRender = useIconRender();
const cachedViewComponents = new Map<string, ReturnType<typeof defineAsyncComponent>>();

export const useMenuStore = defineStore('menu', {
  state: (): IMenuState => ({
    menuOptions: [],
    switchModulesList: [],
    accessedRouters: [],
    dynamicRouteNames: [],
    collapsed: false
  }),
  actions: {
    isMenuVisible(item: LayoutT.MenuItem) {
      return item.isVisible !== false && item.meta?.hidden !== true;
    },
    getDisplayMenuTree(menuData: LayoutT.MenuItem[] = this.getCachedMenuTree()) {
      return this.filterVisibleMenus(menuData);
    },
    filterVisibleMenus(menuData: LayoutT.MenuItem[]) {
      return menuData
        .filter(item => this.isMenuVisible(item))
        .map((item) => {
          const nextItem: LayoutT.MenuItem = {
            ...item
          };

          if (item.children?.length) {
            nextItem.children = this.filterVisibleMenus(item.children);
          }

          return nextItem;
        });
    },
    transformMenuData(data: LayoutT.MenuItem[]): LayoutT.TransformedMenuItem[] {
      return data.map((item: LayoutT.MenuItem) => {
        const newItem: LayoutT.TransformedMenuItem = {
          type: item.type,
          layout: item.layout,
          key: item.path,
          label: item.title,
          icon: iconRender(item.icon),
          routeType: item.meta?.type,
          url: item.meta?.url ? String(item.meta.url) : undefined
        };

        if (item.children && item.children.length) {
          newItem.children = this.transformMenuData(item.children);
        }

        return newItem;
      });
    },
    defaultLoading() {
      const globalStore = useGlobalStore();
      const menuData = this.getDisplayMenuTree();
      this.switchModulesList = this.transformMenuData(menuData);
      if ([ 'modular', 'top' ].includes(globalStore.layout))
        return;
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
      return this.replaceRoutesWithMenu(menuData);
    },
    hasDynamicRoutes() {
      return this.dynamicRouteNames.length > 0 || this.accessedRouters.length > 0;
    },
    addRoutesWithMenu(menuData: LayoutT.MenuItem[] = this.getCachedMenuTree()) {
      const apiMenu = normalizeMenuTree(menuData || []);
      const menuRouter = this.filterAsyncRouter(apiMenu);
      const nextDynamicRouteNames = this.collectRouteNames(menuRouter);

      menuRouter.forEach((route) => {
        const routeName = this.resolveRouteName(route);
        if (routeName && router.hasRoute(routeName)) {
          router.removeRoute(routeName);
        }
        router.addRoute(route);
      });

      this.dynamicRouteNames = nextDynamicRouteNames;
      this.accessedRouters = [ ...menuRouter ];
      return menuRouter;
    },
    replaceRoutesWithMenu(menuData: LayoutT.MenuItem[] = this.getCachedMenuTree()) {
      this.resetDynamicRoutes();
      return this.addRoutesWithMenu(menuData);
    },
    restoreRoutesFromCache() {
      const cachedMenuTree = this.getCachedMenuTree();
      if (!cachedMenuTree.length) {
        this.clearMenuState();
        return false;
      }

      this.replaceRoutesWithMenu(cachedMenuTree);
      return true;
    },
    resetDynamicRoutes() {
      [ ...this.dynamicRouteNames ].reverse().forEach((routeName) => {
        if (router.hasRoute(routeName)) {
          router.removeRoute(routeName);
        }
      });

      this.dynamicRouteNames = [];
      this.accessedRouters = [];
    },
    clearMenuState() {
      this.resetDynamicRoutes();
      this.menuOptions = [];
      this.switchModulesList = [];
      this.collapsed = false;
    },
    filterAsyncRouter(routerMap: LayoutT.MenuItem[]): RouteRecordRaw[] {
      const accessedRouters: RouteRecordRaw[] = [];

      routerMap.forEach((item) => {
        item.meta = item.meta || {};
        if (item.meta.type === 'link') {
          item.meta.url = item.meta.url || item.path;
          return;
        }

        if (item.meta.type === 'iframe') {
          item.meta.url = item.path;
          item.path = `/i/${item.name}`;
        }

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

      return accessedRouters;
    },
    collectRouteNames(routes: RouteRecordRaw[]) {
      const names: string[] = [];

      routes.forEach((route) => {
        const routeName = this.resolveRouteName(route);
        if (routeName) {
          names.push(routeName);
        }

        if (route.children?.length) {
          names.push(...this.collectRouteNames(route.children));
        }
      });

      return names;
    },
    resolveRouteName(route: RouteRecordRaw) {
      if (!route.name) {
        return '';
      }

      return String(route.name);
    },
    loadComponent(component: string) {
      const modulePath = component.includes('/')
        ? `/src/views/${component}.vue`
        : `/src/views/${component}/index.vue`;
      const importer = modules[modulePath];

      if (!importer)
        return undefined;

      const cachedComponent = cachedViewComponents.get(modulePath);
      if (cachedComponent) {
        return cachedComponent;
      }

      const asyncComponent = markRaw(defineAsyncComponent(importer));
      cachedViewComponents.set(modulePath, asyncComponent);
      return asyncComponent;
    }
  }
});
