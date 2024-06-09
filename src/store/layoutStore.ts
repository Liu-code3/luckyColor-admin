import { defineStore } from 'pinia';
import tool from '@/utils/tool';

export const layoutStore = defineStore({
  id: 'layoutStore',
  state: () => ({
    isLocked: tool.data.get('LOCK_SCREEN') ?? false
  }),
  getters: {},
  actions: {
    updateIsLock(isLocked: boolean) {
      this.isLocked = isLocked;
      tool.data.set('LOCK_SCREEN', isLocked);
    }
  }
});

export const useGlobalStore = layoutStore;
