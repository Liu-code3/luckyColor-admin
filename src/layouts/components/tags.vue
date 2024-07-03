<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import tool from '@/utils/tool.ts';
import { useTabStore } from '@/store/modules/tab.ts';

const tabStore = useTabStore();
const router = useRouter();

// 标签页切换
function tabSwitching(value: string) {
  router.push(value);
  tabStore.activeTab = value;
  tool.data.set('LAST_VIEWS_PATH', { path: value });
};

// 关闭标签
function handleClose(path: string) {
  tabStore.removeTab(path);
}
</script>

<template>
  <n-tabs
    :value="tabStore.activeTab"
    type="card"
    :closable="tabStore.tabs.length > 1"
    @close="handleClose"
    @update:value="tabSwitching"
  >
    <template #prefix>
      <Icon class="text-12px" color="#595959" icon="ep:arrow-left" />
    </template>
    <n-tab-pane
      v-for="item in tabStore.tabs"
      :key="item.path"
      :name="item.path"
      :tab="item.label"
    />
  </n-tabs>
</template>
