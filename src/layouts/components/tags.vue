<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useTabStore } from '@/store/modules/tab.ts';

const tabStore = useTabStore();
const router = useRouter();

// 标签页切换
function tabSwitching(value: string) {
  router.push(value);
  tabStore.setActiveTab(value);
}

// 关闭标签
function handleClose(path: string) {
  tabStore.removeTab(path);
}
</script>

<template>
  <div class="tabs_list">
    <n-tabs
      :value="tabStore.activeTab"
      type="card"
      :closable="tabStore.tabs.length > 1"
      @close="handleClose"
      @update:value="tabSwitching"
    >
      <template #prefix>
        <Icon class="text-12px text-primary" icon="ep:arrow-left" />
      </template>
      <n-tab-pane
        v-for="item in tabStore.tabs"
        :key="item.key"
        :name="item.key"
        :tab="item.label"
      />
    </n-tabs>
  </div>
</template>

<style lang="scss" scoped>
.tabs_list :deep(.n-tabs) {
  height: 50px;
  background-color: var(--primary-bgColor);
  padding: 8px;

  .n-tabs-nav__prefix,
  .n-tabs-nav__suffix,
  .n-tabs-pad,
  .n-tabs-wrapper {
    border: none;
  }

  .n-tab-pane {
    display: none;
  }

  .n-tabs-tab {
    height: 34px;
    border: 1px solid var(--primary-bColor);
    background-color: var(--primary-bgColor);
    border-radius: 4px;
  }

  .n-tabs-tab:hover {
    border: 1px solid var(--primary-color) !important;
  }

  .n-tabs-tab--active {
    border: 1px solid #316c72 !important;
    color: var(--primary-color);
    background-color: rgba(88, 143, 244, 0.1) !important;

    .n-base-icon {
      color: var(--primary-color) !important;
    }
  }
}
</style>
