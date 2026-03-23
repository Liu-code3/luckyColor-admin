<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import Tags from '@/layouts/components/tags.vue';
import UserBar from '@/layouts/components/userbar.vue';
import NavMenu from '@/layouts/components/NavMenu.vue';
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
        <n-layout-sider
          class="app-sider"
          :collapsed="menuStore.collapsed"
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="64"
          :width="260"
          :native-scrollbar="false"
        >
          <div class="logo-bar">
            <Icon class="mr-14px text-30px" icon="cryptocurrency-color:ltc" />
            <div class="pl-9px">
              luckyColor admin
            </div>
          </div>
          <NavMenu />
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
  background: var(--theme-background);
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
  margin: 0 0 0 10px;
  color: var(--layout-sider-text-active);
}

.n-layout-scroll-container {
  background: transparent;
}

.n-layout-toggle-button {
  display: none;
}

:deep(.n-layout-toggle-button) {
  display: none;
}
</style>
