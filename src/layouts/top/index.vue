<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import Tags from '@/layouts/components/tags.vue';
import UserBar from '@/layouts/components/userbar.vue';
import NavMenu from '@/layouts/components/NavMenu.vue';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';
import { useGlobalStore } from '@/store/modules/global.ts';
import {
  isExternalLinkMenu,
  openExternalLink,
  resolveExternalLinkUrl,
  resolveMatchedMenuRootPath,
  resolveMenuRoutePath
} from '@/utils/menu-navigation';
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
  const currentTopPath = resolveMatchedMenuRootPath(route);
  const currentTopMenu = topMenus.value.find(item =>
    resolveMenuRoutePath(item) === currentTopPath || item.path === currentTopPath
  );
  activeTopPath.value = currentTopMenu?.path || currentTopPath;

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

    const defaultChildPath = resolveMenuRoutePath(defaultChild);
    menuStore.menuOptions = menuStore.transformMenuData(item.children);
    menuStore.collapsed = false;
    router.push(defaultChildPath);
    syncTabs(defaultChild.title, defaultChildPath);
    return;
  }

  const targetPath = resolveMenuRoutePath(item);
  menuStore.menuOptions = [];
  menuStore.collapsed = true;
  router.push(targetPath);
  syncTabs(item.title, targetPath);
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
            <Icon icon="cryptocurrency-color:ltc" class="text-26px" />
            <div class="top-header-brand__copy">
              <strong>luckyColor admin</strong>
              <span>Workspace</span>
            </div>
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
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :native-scrollbar="false"
        >
          <div class="top-sider-head">
            <span>Current Module</span>
            <strong>当前模块菜单</strong>
          </div>
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
  margin-right: 14px;
  padding-right: 14px;
  color: var(--lc-text-strong);
}

.top-header-brand__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-header-brand__copy strong {
  line-height: 1.15;
}

.top-header-brand__copy span {
  margin-top: 4px;
  color: var(--lc-text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.top-header-menus {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  min-width: 0;
}

.top-header-menus::-webkit-scrollbar {
  display: none;
}

.top-header-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--lc-text-soft);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.top-header-menu:hover {
  background: rgba(var(--primary-color), 0.08);
  color: rgb(var(--primary-color));
}

.top-header-menu--active {
  background: rgba(var(--primary-color), 0.12);
  border-color: rgba(var(--primary-color), 0.22);
  color: rgb(var(--primary-color));
}

.app-sider {
  --layout-sider-sub-text: #ffffff;
  background: var(--layout-sider-bg);
  box-shadow: inset -1px 0 0 var(--layout-sider-border);
}

:deep(.app-sider .n-layout-toggle-button) {
  display: none !important;
}

.top-sider-head {
  padding: 16px 16px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid var(--layout-sider-border);
}

.top-sider-head span {
  color: color-mix(in srgb, var(--layout-sider-text) 78%, transparent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.top-sider-head strong {
  color: var(--layout-sider-text-active);
  font-size: 15px;
}

.n-content {
  height: calc(100vh - var(--layout-content-offset));
  overflow: hidden;
  overflow-y: auto;
  padding: 18px 18px 28px;
  box-sizing: border-box;
  background: transparent;
}

.n-content::-webkit-scrollbar {
  display: none;
}

.n-layout-scroll-container {
  background: transparent;
}

@media (max-width: 1080px) {
  .top-header-brand__copy span {
    display: none;
  }
}

@media (max-width: 768px) {
  .n-content {
    padding: 16px 16px 24px;
  }
}
</style>
