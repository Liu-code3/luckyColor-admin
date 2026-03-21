import { defineStore } from 'pinia';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import router from '@/router';
import tool from '@/utils/tool.ts';

interface TabState {
  tabs: LayoutT.ITab[];
  activeTab: string;
}

export const useTabStore = defineStore('tab', {
  state: (): TabState => ({
    tabs: tool.data.get(AUTH_STORAGE_KEYS.tabs) || [],
    activeTab: tool.data.get(AUTH_STORAGE_KEYS.lastViewPath) || ''
  }),
  getters: {
    activeIndex(): number {
      if (!this.tabs.length) return -1;
      return this.tabs.findIndex((item: LayoutT.ITab) => item.key === this.activeTab);
    }
  },
  actions: {
    async setActiveTab(path: string) {
      await nextTick(); // tab栏dom更新完再设置激活，让tab栏定位到新增的tab上生效
      this.activeTab = path;
      tool.data.set(AUTH_STORAGE_KEYS.lastViewPath, path);
    },
    setTabs(tabs: LayoutT.ITab[]) {
      this.tabs = tabs;
      tool.data.set(AUTH_STORAGE_KEYS.tabs, tabs);
    },
    addTab(tab: LayoutT.ITab) {
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
