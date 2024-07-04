import { defineStore } from 'pinia';
import { useIconRender } from '@/hooks/iconRender.ts';
import tool from '@/utils/tool.ts';

interface IMenuState {
  menuOptions: LayoutT.ILastMenu[];
}

// const tabStore = useTabStore()
const iconRender = useIconRender();
export const useMenuStore = defineStore('menu', {
  state: (): IMenuState => ({
    menuOptions: []
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
    }
  }
});
