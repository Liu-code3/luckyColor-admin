<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';
import {
  isExternalLinkMenu,
  openExternalLink,
  resolveExternalLinkUrl,
  resolveMatchedMenuRootPath,
  resolveMenuRoutePath
} from '@/utils/menu-navigation';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const tabStore = useTabStore();
const switchModulesList = ref<LayoutT.MenuItem[]>([]);
const selectedKeys = ref<string[]>([ '' ]);
const identification = ref<string>('');

watch(() => route.fullPath, async () => {
  try {
    switchModulesList.value = menuStore.getDisplayMenuTree();
    selectedKeys.value = [ route.path ];
    identification.value = resolveActiveModulePath();
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

function resolveActiveModulePath() {
  const currentModulePath = resolveMatchedMenuRootPath(route);
  const activeModule = switchModulesList.value.find(item =>
    resolveMenuRoutePath(item) === currentModulePath || item.path === currentModulePath
  );

  return activeModule?.path || currentModulePath;
}

const switchingModules = (item: LayoutT.MenuItem) => {
  if (isExternalLinkMenu(item)) {
    openExternalLink(resolveExternalLinkUrl(item));
    return;
  }

  identification.value = item.path;
  if (item.children && item.children.length) {
    const defaultChild = item.children[0];
    const defaultChildPath = resolveMenuRoutePath(defaultChild);
    menuStore.menuOptions = menuStore.transformMenuData(item.children);
    if (isExternalLinkMenu(defaultChild)) {
      openExternalLink(resolveExternalLinkUrl(defaultChild));
      return;
    }

    router.push(defaultChildPath);
    tabStore.setActiveTab(defaultChildPath);
    updateTabs(item, defaultChildPath);
    menuStore.collapsed = false;
  }
  else {
    const targetPath = resolveMenuRoutePath(item);
    router.push(targetPath);
    tabStore.setActiveTab(targetPath);
    updateTabs(item, targetPath);
    menuStore.collapsed = true;
  }
};

const updateTabs = (item: LayoutT.MenuItem, targetPath: string) => {
  const exists = tabStore.tabs.some(v => v.key === targetPath);
  if (!exists) {
    const tab = {
      label: item.title,
      key: targetPath,
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
  color: var(--layout-sider-text);
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
  color: var(--layout-sider-text-active);
  background: var(--layout-sider-hover);
}

.modular_select {
  color: var(--layout-sider-text-active);
  background-color: rgba(var(--primary-color), 0.24);
}
</style>
