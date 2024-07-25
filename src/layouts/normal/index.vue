<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import Tags from '@/layouts/components/tags.vue';
import UserBar from '@/layouts/components/userbar.vue';
import NavMenu from '@/layouts/components/NavMenu.vue';
import { useMenuStore } from '@/store/modules/menu.ts';

const menuStore = useMenuStore();
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout has-sider>
        <n-layout-sider
          :collapsed="menuStore.collapsed"
          bordered show-trigger collapse-mode="width" :collapsed-width="64" :width="260"
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
          <!-- 头部 -->
          <UserBar />
          <!-- 标签页 -->
          <Tags />
          <div class="n-content">
            <slot />
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style lang="less" scoped>
.n-scrollbar-content {
  border-right: 2px solid var(--primary-bColor);
}
.n-content {
  height: calc(100vh - 111px);
  overflow: hidden;
  overflow-y: scroll;
  padding: 10px;
  box-sizing: border-box;
  background-color: var(--primary-main-bg);
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
}

.n-tabs {
  height: 50px;
  background-color: var(--primary-bgColor);
  padding: 8px;
  border-bottom: 1px solid var(--primary-bColor);

  .n-tabs-nav__prefix,
  .n-tabs-nav__suffix,
  .n-tabs-pad,
  .n-tabs-wrapper {
    border: none !important;
  }

  .n-tab-pane {
    display: none;
  }

  .n-tabs-tab {
    height: 34px;
    border: 1px solid var(--primary-bColor);
    background-color: var(--primary-bgColor);
    border-radius: 4px;
  }

  .n-tabs-tab--active {
    border: 1px solid var(--primary-bColor);
    color: var(--primary-bgColor);
    background-color: var(--primary-bgColor);

    .n-base-icon {
      color: #588ff4;
    }
  }
}

.n-layout-scroll-container {
  background-color: #f6f8f9;
}

.n-layout-toggle-button {
  display: none !important;
}
</style>
