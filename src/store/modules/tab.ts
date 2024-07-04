import { defineStore } from 'pinia';
import router from '@/router';
import tool from '@/utils/tool.ts';

interface TabState {
  tabs: LayoutT.ILastMenu[];
  activeTab: string;
}

export const useTabStore = defineStore('tab', {
  state: (): TabState => ({
    tabs: tool.data.get('tabs') || [],
    activeTab: tool.data.get('LAST_VIEWS_PATH') || ''
  }),
  getters: {
    activeIndex(): number {
      if (!this.tabs.length) return -1;
      return this.tabs.findIndex((item: LayoutT.ILastMenu) => item.key === this.activeTab);
    }
  },
  actions: {
    async setActiveTab(path: string) {
      await nextTick(); // tab栏dom更新完再设置激活，让tab栏定位到新增的tab上生效
      this.activeTab = path;
      tool.data.set('LAST_VIEWS_PATH', path);
    },
    setTabs(tabs: LayoutT.ILastMenu[]) {
      this.tabs = tabs;
      tool.data.set('tabs', tabs);
    },
    addTab(tab: LayoutT.ILastMenu) {
      const findIndex = this.tabs.findIndex(item => item.key === tab.key);
      if (findIndex !== -1) {
        this.tabs.splice(findIndex, 1, tab);
        this.setTabs(this.tabs);
        return;
      }
      this.setTabs([ ...this.tabs, tab ]);
      this.setActiveTab(tab.key);
    },
    async removeTab(path: string) {
      this.setTabs(this.tabs.filter(tab => tab.key !== path));
      if (path === this.activeTab) {
        await router?.push(this.tabs[this.tabs.length - 1].key);
        await this.setActiveTab(this.tabs[this.tabs.length - 1].key);
      }
    }
  }
});
