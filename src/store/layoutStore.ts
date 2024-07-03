import { defineStore } from 'pinia';
import tool from '@/utils/tool';
import DEFAULT_CONFIG from '@/config';

enum Layout {
  LOCK_SCREEN = 'LOCK_SCREEN',
  LAYOUT = 'layout'
}

export const layoutStore = defineStore({
  id: 'layoutStore',
  state: () => ({
    isLocked: tool.session.get(Layout.LOCK_SCREEN) ?? false,
    layout: tool.session.get(Layout.LAYOUT) ?? DEFAULT_CONFIG.LUCK_LAYOUT
  }),
  actions: {
    updateIsLock(isLocked: boolean) {
      this.isLocked = isLocked;
      tool.session.set(Layout.LOCK_SCREEN, isLocked);
    },
    updateLayout(layout: string) {
      this.layout = layout;
      tool.session.set(Layout.LAYOUT, layout);
    }
  }
});

export const useGlobalStore = layoutStore;
