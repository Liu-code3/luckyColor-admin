<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import Tags from '@/layouts/components/tags.vue';
import NavMenu from '@/layouts/components/NavMenu.vue';
import Modular from '@/layouts/components/modular.vue';
import UserBar from '@/layouts/components/userbar.vue';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useGlobalStore } from '@/store/modules/global.ts';

const menuStore = useMenuStore();
const globalStore = useGlobalStore();

const contentStyle = computed(() => ({
  '--layout-content-offset': globalStore.showTabs ? '111px' : '61px'
}));
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout has-sider>
        <div class="modular">
          <div class="logo-bar logo-bar--compact">
            <Icon icon="cryptocurrency-color:ltc" />
          </div>
          <Modular class="mt-7" />
        </div>
        <n-layout-sider
          class="app-sider"
          :collapsed="menuStore.collapsed"
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="0"
          :width="220"
          :native-scrollbar="false"
        >
          <div class="logo-bar">
            <div class="pl-9px">
              luckyColor admin
            </div>
          </div>
          <div>
            <NavMenu />
          </div>
        </n-layout-sider>
        <n-layout-content>
          <UserBar />
          <Tags v-if="globalStore.showTabs" />
          <div class="n-content" :style="contentStyle">
            <slot />
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style lang="scss" scoped>
.n-scrollbar-content {
  border-right: 1px solid var(--layout-sider-border);
}

.modular {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--layout-sider-bg);
  color: var(--layout-sider-text);
  border-right: 1px solid var(--layout-sider-border);
  flex: none;

  .logo-bar {
    width: 100%;
    height: 60px;
    font-size: 38px;
    flex: none;
    margin: 0;
    color: var(--layout-sider-text-active);
  }
}

.app-sider {
  background: var(--layout-sider-bg);
  box-shadow: inset -1px 0 0 var(--layout-sider-border);
}

.n-content {
  height: calc(100vh - var(--layout-content-offset));
  overflow: hidden;
  overflow-y: scroll;
  padding: 10px;
  box-sizing: border-box;
  background-color: var(--theme-background);
}

.n-content::-webkit-scrollbar {
  display: none;
}

.logo-bar {
  width: 220px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex: none;
  color: var(--layout-sider-text-active);
}

.n-layout-scroll-container {
  background: transparent;
}

.n-layout-toggle-button {
  display: none !important;
}

:deep(.n-layout-toggle-button) {
  display: none;
}
</style>
