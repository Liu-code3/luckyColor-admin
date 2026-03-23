<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const tabStore = useTabStore();
const switchModulesList = ref<LayoutT.MenuItem[]>([]);
const selectedKeys = ref<string[]>([ '' ]);
const identification = ref<string>('');

// 监听路由变化并初始化数据
watch(() => route.fullPath, async () => {
  try {
    switchModulesList.value = menuStore.getCachedMenuTree();
    selectedKeys.value = [ route.fullPath ];
    identification.value = getBeforeSecondSlash(route.fullPath);
    switchModulesList.value.forEach((item) => {
      checkAndSetMenuOptions(item);
    });
  }
  catch (error) {
    console.error('Failed to initialize menu data:', error);
  }
}, { immediate: true });

function checkAndSetMenuOptions(item: LayoutT.MenuItem) {
  if (item.path === identification.value) {
    if (item.children) {
      menuStore.menuOptions = menuStore.transformMenuData(item.children);
      menuStore.collapsed = false;
    }
    else {
      menuStore.menuOptions = [];
      menuStore.collapsed = true;
    }
  }
}

// 获取路径中的第二个斜杠之前的部分
function getBeforeSecondSlash(url: string): string {
  const secondSlashIndex = url.indexOf('/', 1);
  return secondSlashIndex !== -1 ? url.substring(0, secondSlashIndex) : url;
}

const switchingModules = (item: LayoutT.MenuItem) => {
  identification.value = item.path;
  if (item.children && item.children.length) {
    menuStore.menuOptions = menuStore.transformMenuData(item.children);
    const defaultChildPath = item.children[0].path;
    router.push(defaultChildPath);
    tabStore.setActiveTab(defaultChildPath);
    updateTabs(item, defaultChildPath);
    menuStore.collapsed = false;
  }
  else {
    router.push(item.path);
    tabStore.setActiveTab(item.path);
    updateTabs(item, item.path);
    menuStore.collapsed = true;
  }
};

const updateTabs = (item: LayoutT.MenuItem, defaultChildPath: string) => {
  const exists = tabStore.tabs.some(v => v.key === defaultChildPath);
  if (!exists) {
    const tab = {
      label: item.title,
      key: item.path,
      layout: item.layout
    };
    tabStore.addTab(tab);
  }
};
</script>

<template>
  <div class="modular_box">
    <div
      v-for="item in switchModulesList"
      :key="item.path"
      class="modular_each cursor-pointer"
      :class="{ modular_select: identification === item.path }"
      @click="() => switchingModules(item)"
    >
      <Icon :icon="item.icon" />
      <div>{{ item.title }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modular_each {
  width: 70px;
  color: #a6adb4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 20px;
  border-radius: 10%;
  padding: 10px 0;

  div {
    font-size: 13px;
    margin-top: 4px;
  }
}

.modular_each:hover {
  color: #ffffff;
}

.modular_select {
  color: #ffffff;
  background-color: #4e88f3;
}
</style>
