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
          <div class="modular-eyebrow">
            Modules
          </div>
          <Modular class="mt-4" />
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
            <div class="logo-copy">
              <strong>luckyColor admin</strong>
              <span>Workspace</span>
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
  min-height: 100vh;
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
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 34px;
    flex: none;
    margin: 0;
    color: var(--layout-sider-text-active);
  }
}

.modular-eyebrow {
  width: 100%;
  text-align: center;
  color: rgba(226, 232, 240, 0.56);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
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
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 18px;
  flex: none;
  color: var(--layout-sider-text-active);
  border-bottom: 1px solid var(--layout-sider-border);
}

.logo-copy {
  display: flex;
  flex-direction: column;
}

.logo-copy strong {
  font-size: 15px;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.logo-copy span {
  margin-top: 4px;
  color: rgba(226, 232, 240, 0.64);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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

@media (max-width: 768px) {
  .logo-copy span,
  .modular-eyebrow {
    display: none;
  }
}
</style>
