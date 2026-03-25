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
          <div class="logo-bar" :class="{ 'logo-bar--collapsed': menuStore.collapsed }">
            <div class="logo-mark">
              <Icon class="text-26px" icon="cryptocurrency-color:ltc" />
            </div>
            <div class="logo-copy" :class="{ 'logo-copy--collapsed': menuStore.collapsed }">
              <strong>luckyColor admin</strong>
              <span>Workspace</span>
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
  padding: 18px 18px 28px;
  box-sizing: border-box;
  background: transparent;
}

.n-content::-webkit-scrollbar {
  display: none;
}

.logo-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 20px;
  overflow: hidden;
  color: var(--layout-sider-text-active);
  border-bottom: 1px solid var(--layout-sider-border);
  transition: padding 0.2s ease, gap 0.2s ease;
}

.logo-bar--collapsed {
  gap: 0;
  padding: 0;
}

.logo-mark {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  flex: none;
}

.logo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 160px;
  overflow: hidden;
  white-space: nowrap;
  transition:
    max-width 0.2s ease,
    opacity 0.16s ease,
    transform 0.2s ease;
}

.logo-copy--collapsed {
  max-width: 0;
  opacity: 0;
  transform: translateX(-6px);
  pointer-events: none;
}

.logo-copy strong {
  font-size: 15px;
  line-height: 1.2;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-copy span {
  margin-top: 4px;
  color: rgba(226, 232, 240, 0.64);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
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

@media (max-width: 768px) {
  .logo-copy span {
    display: none;
  }

  .n-content {
    padding: 16px 16px 24px;
  }
}
</style>
