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

const switchingModules = async (item: LayoutT.MenuItem) => {
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

    await router.push(defaultChildPath);
    await tabStore.setActiveTab(defaultChildPath);
    updateTabs(item, defaultChildPath);
    menuStore.collapsed = false;
  }
  else {
    const targetPath = resolveMenuRoutePath(item);
    await router.push(targetPath);
    await tabStore.setActiveTab(targetPath);
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
  border-radius: 22px;
  padding: 12px 0;
  border: 1px solid transparent;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  div {
    font-size: 13px;
    margin-top: 6px;
    text-align: center;
    line-height: 1.35;
  }
}

.modular_each:hover {
  color: var(--layout-sider-text-active);
  background: var(--layout-sider-hover);
  border-color: var(--layout-sider-border);
  transform: translateY(-1px);
}

.modular_select {
  color: var(--layout-sider-text-active);
  background:
    linear-gradient(180deg, rgba(var(--primary-color), 0.28), rgba(var(--primary-color), 0.16));
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
</style>
