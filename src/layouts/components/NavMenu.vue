<script lang="ts" setup>
import type { MenuInst } from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';

const router = useRouter();
const route = useRoute();
const menuStore = useMenuStore();
const tabStore = useTabStore();

// 展开选中的菜单项
const menuInstRef = ref<MenuInst | null>(null);
watch(route, async () => {
  await nextTick();
  menuInstRef.value?.showOption();
}, { immediate: true });

// 反转
const inverted = ref(false);

// 切换菜单
function handleUpdateValue(key: string, item: any) {
  router.push(key);
  tabStore.setActiveTab(key);
  const exists = tabStore.tabs.some(item => item.key === key);
  if (!exists) {
    tabStore.addTab(item);
  }
}

onMounted(() => {
  menuStore.defaultLoading();
});
</script>

<template>
  <n-menu
    ref="menuInstRef"
    v-model:value="tabStore.activeTab"
    :inverted="inverted"
    :collapsed-width="64"
    :collapsed-icon-size="22"
    :options="menuStore.menuOptions"
    class="h-91vh"
    @update:value="handleUpdateValue"
  />
</template>
