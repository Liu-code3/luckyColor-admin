<script lang="ts" setup>
import {Icon} from '@iconify/vue';
import Tags from '@/layouts/components/tags.vue';
import NavMenu from '@/layouts/components/NavMenu.vue';
import Modular from '@/layouts/components/modular.vue';
import {useMenuStore} from '@/store/modules/menu.ts';
import UserBar from "@/layouts/components/userbar.vue";

const menuStore = useMenuStore();
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout has-sider>
        <div class="modular">
          <div class="logo-bar">
            <Icon icon="cryptocurrency-color:ltc"/>
          </div>
          <Modular class="mt-7"/>
        </div>
        <n-layout-sider
            :collapsed="menuStore.collapsed"
            bordered show-trigger collapse-mode="width" :collapsed-width="0" :width="220"
            :native-scrollbar="false"
        >
          <div class="logo-bar">
            <div class="pl-9px">
              luckyColor admin
            </div>
          </div>
          <div>
            <NavMenu/>
          </div>
        </n-layout-sider>
        <n-layout-content>
          <!-- 头部 -->
          <UserBar/>
          <!-- 标签页 -->
          <Tags/>
          <div class="n-content">
            <slot/>
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style lang="scss" scoped>
.n-scrollbar-content {
  border-right: solid #dcdfe6 2px;
}

.modular {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #282c34;
  flex: none;

  .logo-bar {
    width: 100%;
    height: 60px;
    font-size: 38px;
    flex: none;
    margin: 0;
  }
}

.n-content {
  height: calc(100vh - 112px);
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
}

.n-layout-scroll-container {
  background-color: #f6f8f9;
}

.n-layout-toggle-button {
  display: none !important;
}
:deep(.n-layout-toggle-button){
  display: none;
}
</style>
