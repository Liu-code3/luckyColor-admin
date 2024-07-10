import { defineStore } from 'pinia';
import tool from '@/utils/tool.ts';
import DEFAULT_CONFIG from '@/config';



enum Global {
  LOCK_SCREEN = 'LOCK_SCREEN',
  LAYOUT = 'layout'
}

export const useGlobalStore = defineStore('layout', {
  state: () => ({
    isLocked: tool.session.get(Global.LOCK_SCREEN) ?? false,
    layout: tool.session.get(Global.LAYOUT) ?? DEFAULT_CONFIG.LUCK_LAYOUT
  }),
  actions: {
    updateIsLock(isLocked: boolean) {
      this.isLocked = isLocked;
      tool.session.set(Global.LOCK_SCREEN, isLocked);
    },
    updateLayout(layout: string) {
      this.layout = layout;
      tool.session.set(Global.LAYOUT, layout);
    }
  }
});
