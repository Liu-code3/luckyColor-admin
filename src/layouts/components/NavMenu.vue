<script lang="ts" setup>
import type { MenuInst } from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useTabStore } from '@/store/modules/tab.ts';
import { isExternalLinkMenu, openExternalLink, resolveExternalLinkUrl } from '@/utils/menu-navigation';

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

// 切换菜单
async function handleUpdateValue(key: string, item: LayoutT.TransformedMenuItem) {
  if (isExternalLinkMenu(item)) {
    openExternalLink(resolveExternalLinkUrl(item));
    return;
  }

  await router.push(key);
  await tabStore.setActiveTab(key);
  const exists = tabStore.tabs.some(item => item.key === key);
  if (!exists) {
    const tab = {
      label: item.label,
      key: item.key,
      layout: item.layout
    };
    tabStore.addTab(tab);
  }
}

onMounted(() => {
  menuStore.defaultLoading();
});
</script>

<template>
  <div class="nav-menu-shell">
    <n-menu
      ref="menuInstRef"
      v-model:value="tabStore.activeTab"
      :collapsed-width="64"
      :collapsed-icon-size="20"
      :root-indent="18"
      :indent="28"
      :options="menuStore.menuOptions"
      class="nav-menu"
      @update:value="handleUpdateValue"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.nav-menu-shell) {
  padding: 8px 0 16px;
}

:deep(.n-menu) {
  background: transparent;
  --n-border-radius: 10px;
}

:deep(.nav-menu .n-menu-item-content),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content),
:deep(.nav-menu .n-submenu .n-menu-item-content-header),
:deep(.nav-menu .n-submenu .n-menu-item-content__icon),
:deep(.nav-menu .n-menu-item-content__icon),
:deep(.nav-menu .n-menu-item-content-header__label) {
  color: var(--layout-sider-text);
}

:deep(.nav-menu .n-menu-item),
:deep(.nav-menu .n-submenu) {
  margin: 2px 0;
}

:deep(.nav-menu .n-menu-item-content),
:deep(.nav-menu .n-submenu .n-menu-item-content-header) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 40px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

:deep(.nav-menu .n-menu-item-content::before),
:deep(.nav-menu .n-submenu .n-menu-item-content-header::before) {
  left: 0 !important;
  right: 0 !important;
  border-radius: inherit !important;
}

:deep(.nav-menu .n-menu-item-content .n-menu-item-content-header__label),
:deep(.nav-menu .n-submenu .n-menu-item-content-header .n-menu-item-content-header__label) {
  display: flex;
  align-items: center;
  line-height: 1.35;
}

:deep(.nav-menu .n-menu-item-content:hover),
:deep(.nav-menu .n-submenu .n-menu-item-content-header:hover) {
  background: transparent !important;
  border-color: var(--layout-sider-hover-border) !important;
  color: var(--layout-sider-hover-text) !important;
}

:deep(.nav-menu .n-menu-item-content:hover::before),
:deep(.nav-menu .n-submenu .n-menu-item-content-header:hover::before) {
  background: var(--layout-sider-hover) !important;
}

:deep(.nav-menu .n-submenu.n-submenu--active > .n-menu-item-content-header),
:deep(.nav-menu .n-menu-item-content.n-menu-item-content--selected) {
  background: transparent !important;
  border-color: var(--layout-sider-selected-border) !important;
}

:deep(.nav-menu .n-submenu.n-submenu--active > .n-menu-item-content-header::before),
:deep(.nav-menu .n-menu-item-content.n-menu-item-content--selected::before) {
  background: var(--layout-sider-selected-bg) !important;
}

:deep(.nav-menu .n-submenu .n-submenu-children) {
  margin-top: 4px;
  padding-left: 0;
}

:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content) {
  color: var(--layout-sider-sub-text) !important;
  opacity: 1;
  font-weight: 500;
}

:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content-header__label),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content-header a),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content-header__extra),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content__icon),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content__icon .n-icon),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content__icon svg),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content__icon svg *),
:deep(.nav-menu .n-submenu .n-submenu-children .n-menu-item-content .n-menu-item-content__icon .iconify) {
  color: inherit !important;
  fill: currentColor;
  stroke: currentColor;
}

:deep(.nav-menu .n-menu-item-content__icon) {
  width: 24px;
  justify-content: center;
  font-size: 17px;
}

:deep(.nav-menu .n-submenu .n-menu-item-content-header__arrow) {
  opacity: 0.68;
}

:deep(.nav-menu .n-menu-item-content:hover .n-menu-item-content-header__label),
:deep(.nav-menu .n-menu-item-content:hover .n-menu-item-content__icon),
:deep(.nav-menu .n-menu-item-content:hover .n-menu-item-content__arrow),
:deep(.nav-menu .n-submenu .n-menu-item-content-header:hover .n-menu-item-content-header__label),
:deep(.nav-menu .n-submenu .n-menu-item-content-header:hover .n-menu-item-content__icon),
:deep(.nav-menu .n-submenu .n-menu-item-content-header:hover .n-menu-item-content-header__arrow) {
  color: inherit !important;
}

:deep(.nav-menu .n-menu-item-content.n-menu-item-content--selected .n-menu-item-content-header__label),
:deep(.nav-menu .n-menu-item-content.n-menu-item-content--selected .n-menu-item-content__icon),
:deep(.nav-menu .n-menu-item-content.n-menu-item-content--selected .n-menu-item-content__arrow),
:deep(.nav-menu .n-submenu.n-submenu--active > .n-menu-item-content-header),
:deep(.nav-menu .n-submenu.n-submenu--active > .n-menu-item-content-header .n-menu-item-content-header__label),
:deep(.nav-menu .n-submenu.n-submenu--active > .n-menu-item-content-header .n-menu-item-content__icon) {
  color: var(--layout-sider-selected-text) !important;
}

:deep(.nav-menu .n-menu-item-content.n-menu-item-content--selected .n-menu-item-content-header__label),
:deep(.nav-menu .n-submenu.n-submenu--active > .n-menu-item-content-header .n-menu-item-content-header__label) {
  font-weight: 600;
}

:deep(.nav-menu .n-menu-item-content.n-menu-item-content--collapsed),
:deep(.nav-menu .n-submenu .n-menu-item-content-header.n-menu-item-content--collapsed) {
  justify-content: center;
}
</style>

