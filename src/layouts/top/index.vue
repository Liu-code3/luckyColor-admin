<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import Tags from '@/layouts/components/tags.vue';
import UserBar from '@/layouts/components/userbar.vue';
import NavMenu from '@/layouts/components/NavMenu.vue';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';
import { useGlobalStore } from '@/store/modules/global.ts';
import { isExternalLinkMenu, openExternalLink, resolveExternalLinkUrl } from '@/utils/menu-navigation';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const tabStore = useTabStore();
const globalStore = useGlobalStore();

const topMenus = ref<LayoutT.MenuItem[]>([]);
const activeTopPath = ref('');

const showSideMenu = computed(() => menuStore.menuOptions.length > 0);
const contentStyle = computed(() => ({
  '--layout-content-offset': globalStore.showTabs ? '110px' : '60px'
}));

function resolveTopPath(fullPath: string) {
  const secondSlashIndex = fullPath.indexOf('/', 1);
  return secondSlashIndex !== -1 ? fullPath.slice(0, secondSlashIndex) : fullPath;
}

function syncTabs(label: string, path: string, layout = 'top') {
  tabStore.setActiveTab(path);
  const exists = tabStore.tabs.some(item => item.key === path);
  if (!exists) {
    tabStore.addTab({
      label,
      key: path,
      layout
    });
  }
}

function syncTopMenus() {
  topMenus.value = menuStore.getDisplayMenuTree();
  activeTopPath.value = resolveTopPath(route.fullPath);

  const activeTopMenu = topMenus.value.find(item => item.path === activeTopPath.value);
  if (activeTopMenu?.children?.length) {
    menuStore.menuOptions = menuStore.transformMenuData(activeTopMenu.children);
    menuStore.collapsed = false;
    return;
  }

  menuStore.menuOptions = [];
  menuStore.collapsed = true;
}

function switchTopMenu(item: LayoutT.MenuItem) {
  if (isExternalLinkMenu(item)) {
    openExternalLink(resolveExternalLinkUrl(item));
    return;
  }

  activeTopPath.value = item.path;

  if (item.children?.length) {
    const defaultChild = item.children[0];
    if (isExternalLinkMenu(defaultChild)) {
      openExternalLink(resolveExternalLinkUrl(defaultChild));
      return;
    }

    menuStore.menuOptions = menuStore.transformMenuData(item.children);
    menuStore.collapsed = false;
    router.push(defaultChild.path);
    syncTabs(defaultChild.title, defaultChild.path);
    return;
  }

  menuStore.menuOptions = [];
  menuStore.collapsed = true;
  router.push(item.path);
  syncTabs(item.title, item.path);
}

watch(() => route.fullPath, () => {
  syncTopMenus();
}, { immediate: true });
</script>

<template>
  <n-space vertical>
    <n-layout>
      <UserBar :show-breadcrumb="false" :show-collapse="false">
        <template #left>
          <div class="top-header-brand">
            <Icon icon="cryptocurrency-color:ltc" class="text-28px" />
            <strong>luckyColor admin</strong>
          </div>

          <div class="top-header-menus">
            <button
              v-for="item in topMenus"
              :key="item.path"
              type="button"
              class="top-header-menu"
              :class="{ 'top-header-menu--active': activeTopPath === item.path }"
              @click="switchTopMenu(item)"
            >
              <Icon v-if="item.icon" :icon="item.icon" />
              <span>{{ item.title }}</span>
            </button>
          </div>
        </template>
      </UserBar>

      <n-layout has-sider>
        <n-layout-sider
          v-if="showSideMenu"
          class="app-sider"
          :collapsed="menuStore.collapsed"
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :native-scrollbar="false"
        >
          <NavMenu />
        </n-layout-sider>

        <n-layout-content>
          <Tags v-if="globalStore.showTabs" />
          <div class="n-content" :style="contentStyle">
            <slot />
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style scoped lang="scss">
.top-header-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: fit-content;
  margin-right: 18px;
  color: #0f172a;
}

.top-header-menus {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.top-header-menus::-webkit-scrollbar {
  display: none;
}

.top-header-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.top-header-menu:hover {
  background: rgba(37, 99, 235, 0.08);
  color: rgb(var(--primary-color));
}

.top-header-menu--active {
  background: rgba(var(--primary-color), 0.12);
  border-color: rgba(var(--primary-color), 0.22);
  color: rgb(var(--primary-color));
}

.app-sider {
  background: var(--layout-sider-bg);
  box-shadow: inset -1px 0 0 var(--layout-sider-border);
}

.n-content {
  height: calc(100vh - var(--layout-content-offset));
  overflow: hidden;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
  background: var(--theme-background);
}

.n-content::-webkit-scrollbar {
  display: none;
}

.n-layout-scroll-container {
  background: transparent;
}

@media (max-width: 1080px) {
  .top-header-brand strong {
    display: none;
  }
}
</style>
