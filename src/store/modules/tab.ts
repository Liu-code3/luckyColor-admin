import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import tool from '@/utils/tool.ts';

interface TabState {
  tabs: LayoutT.TransformedMenuItem[];
  activeTab: string;
}
const router = useRouter();
export const useTabStore = defineStore('tab', {
  state: (): TabState => ({
    tabs: tool.session.get('tabs') || [],
    activeTab: ''
  }),
  getters: {
    activeIndex(): number {
      if (!this.tabs.length) return -1;
      return this.tabs.findIndex((item: LayoutT.TransformedMenuItem) => item.path === this.activeTab);
    }
  },
  actions: {
    async setActiveTab(path: string) {
      await nextTick(); // tab栏dom更新完再设置激活，让tab栏定位到新增的tab上生效
      this.activeTab = path;
    },
    setTabs(tabs: LayoutT.TransformedMenuItem[]) {
      this.tabs = tabs;
      tool.session.set('tabs', tabs);
    },
    addTab(tab: LayoutT.TransformedMenuItem) {
      const findIndex = this.tabs.findIndex(item => item.path === tab.path);
      if (findIndex !== -1) {
        this.tabs.splice(findIndex, 1, tab);
        this.setTabs(this.tabs);
        return;
      }
      this.setTabs([ ...this.tabs, tab ]);
    },
    async removeTab(path: string) {
      this.setTabs(this.tabs.filter(tab => tab.path !== path));
      if (path === this.activeTab) {
        router?.push(this.tabs[this.tabs.length - 1].path);
      }
    }
  }
});
