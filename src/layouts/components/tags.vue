<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useTabStore } from '@/store/modules/tab.ts';

const tabStore = useTabStore();
const router = useRouter();

// 标签页切换
async function tabSwitching(value: string) {
  await router.push(value);
  await tabStore.setActiveTab(value);
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
      border="1px solid light_border dark:dark_border"
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
  margin: 10px 10px 0;
  padding: 8px;
  border: 1px solid var(--lc-border);
  border-radius: 20px;
  background: var(--lc-surface);
  box-shadow: var(--lc-shadow-sm);
  backdrop-filter: var(--lc-backdrop);

  .n-tabs-nav__prefix,
  .n-tabs-nav__suffix,
  .n-tabs-pad,
  .n-tabs-wrapper {
    border: none !important;
  }

  .n-tab-pane {
    display: none;
  }

  .n-tabs-tab {
    height: 34px;
    border-radius: 999px !important;
    border: 1px solid transparent !important;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }

  .n-tabs-tab:hover {
    border: 1px solid rgba(var(--primary-color), 0.2) !important;
    background-color: rgba(var(--primary-color), 0.08) !important;
  }

  .n-tabs-tab--active {
    border: 1px solid rgba(var(--primary-color), 0.22) !important;
    background-color: rgba(var(--primary-color), 0.12) !important;

    .n-base-icon {
      color: rgb(var(--primary-color)) !important;
    }
  }
}

@media (max-width: 768px) {
  .tabs_list :deep(.n-tabs) {
    margin: 8px 8px 0;
    border-radius: 18px;
  }
}
</style>
