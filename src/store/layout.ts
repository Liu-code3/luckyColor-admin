import { defineStore } from 'pinia';
// import { useRouter } from 'vue-router';
import tool from '@/utils/tool';
import { useIconRender } from '@/hooks/iconRender';

const iconRender = useIconRender();
// const router = useRouter();

export const layout = defineStore({
  id: 'layout',
  state: () => ({
    menuData: tool.data.get('MENU') as LayoutT.MenuItem[],
    menuOptions: [], // 菜单
    inverted: false, // 反转
    tabsList: [], // 标签
    defaultLabels: '' // 标签

  }),
  getters: {},
  actions: {
    // 切换菜单
    // handleUpdateValue(key: string, item: any) {
    //   console.log(item, 'item')
    //   router.push(key);
    //   tool.data.set('LAST_VIEWS_PATH', { key });
    //   this.defaultLabels = key;
    //   const exists = this.tabsList.some((item: LayoutT.TransformedMenuItem) => item.key === key);
    //   if (!exists) {
    //     this.tabsList.push(item);
    //     tool.data.set('LAST_MUN', this.tabsList);
    //   }
    // }
  }
});

export const useLayout = layout;

// 路由传换为菜单
export function transformMenuData(data: LayoutT.MenuItem[]): LayoutT.TransformedMenuItem[] {
  return data.map((item) => {
    const newItem: LayoutT.TransformedMenuItem = {
      pid: item.pid,
      id: item.id,
      label: item.title,
      key: item.path,
      icon: iconRender(item.icon)
    };

    if (item.children && item.children.length > 0)
      newItem.children = transformMenuData(item.children);

    return newItem;
  });
}
