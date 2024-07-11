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
      <n-layout has-sider >
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

<style lang="less">
.n-scrollbar-content {
  border-right: solid #dcdfe6 2px;
}
.n-content {
  height: calc(100vh - 111px);
  overflow: hidden;
  overflow-y: scroll;
  padding: 10px;
  box-sizing: border-box;
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
  background-color: #fff;
  padding: 8px;
  border-bottom: solid #dcdfe6 1px;

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
    border: #dcdfe6 solid 1px !important;
    background-color: #fff !important;
    border-radius: 4px !important;
  }

  .n-tabs-tab--active {
    border: #588ff4 solid 1px !important;
    color: #588ff4 !important;
    background-color: rgba(88, 143, 244, 0.1) !important;

    .n-base-icon {
      color: #588ff4 !important;
    }
  }
}

.n-layout-scroll-container {
  background-color: #f6f8f9;
}
.n-layout-toggle-button{
  display: none !important;
}
</style>
