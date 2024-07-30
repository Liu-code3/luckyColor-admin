<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useMessage } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useFullscreen } from '@vueuse/core';
import Breadcrumb from './breadcrumb.vue';
import { useGlobalStore } from '@/store/modules/global.ts';
import tool from '@/utils/tool.ts';
import { useTabStore } from '@/store/modules/tab.ts';
import { useMenuStore } from '@/store/modules/menu.ts';
import SwitchTheme from '@/layouts/components/switchTheme.vue';

const router = useRouter();
const message = useMessage();
const { isFullscreen, toggle } = useFullscreen();
const globalStore = useGlobalStore();
const tabStore = useTabStore();
const menuStore = useMenuStore();

// 锁屏
function JumpLock() {
  globalStore.updateIsLock(true);
}

// 刷新
function refresh() {
  location.reload();
}

const options = ref([
  {
    label: '退出登录',
    key: 'signOut'
  }
]);

function onSelected(key: string | number) {
  if (key === 'signOut')
    signOut();
}

const fold_fn = () => {
  menuStore.collapsed = !menuStore.collapsed;
};

// 退出登录
function signOut() {
  tool.data.clear();
  tabStore.$reset();
  router.push('/login');
  message.success(
    '退出登录成功'
  );
}

function handleLinkClick(link: string) {
  window.open(link, '_blank');
}

const settingDrawer = ref(false);

const layoutList = [
  {
    tips: '经典',
    value: 'normal',
    style: 'setting-layout-menu-classical'
  },
  {
    tips: '内容全屏',
    value: 'empty',
    style: 'setting-layout-menu-doublerow'
  }
];

function openSetting() {
  settingDrawer.value = true;
}
</script>

<template>
  <div class="layout-content-luckHeader">
    <div class="layout-content-left">
      <Icon
        :icon="menuStore.collapsed ? 'line-md:menu-fold-right' : 'line-md:menu-fold-left'"
        class="mr-10px h-20px w-20px color-primary"
        @click="fold_fn"
      />
      <Breadcrumb />
    </div>
    <div class="layout-content-right">
      <SwitchTheme />
      <Icon
        class="mx-3 cursor-pointer text-5 color-primary"
        icon="hugeicons:github"
        @click="handleLinkClick('https://github.com/Liu-code3/luckyColor-admin')"
      />
      <Icon
        class="cursor-pointer text-5 color-primary"
        icon="tabler:lock-filled"
        @click="JumpLock"
      />
      <Icon
        class="mx-3 cursor-pointer text-5 color-primary"
        :icon="isFullscreen ? 'fluent:full-screen-minimize-16-regular' : 'fluent:full-screen-maximize-16-regular'"
        @click="toggle"
      />
      <Icon
        class="cursor-pointer text-5 color-primary"
        icon="mdi:circular-arrows"
        @click="refresh"
      />

      <n-dropdown :options="options" @select="onSelected">
        <div class="mx-2.5 flex cursor-pointer items-center">
          <n-avatar round size="medium" src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
          <div class="ml-1px flex-shrink-0 flex-col items-center">
            <span class="ml-4px text-14px text-primary">用户资料</span>
          </div>
        </div>
      </n-dropdown>

      <Icon
        class="cursor-pointer text-5 color-primary"
        icon="iwwa:settings"
        @click="openSetting"
      />

      <!-- 整体风格设置抽屉 -->
      <n-drawer v-model:show="settingDrawer" :width="480">
        <n-drawer-content :native-scrollbar="false">
          <h3>整体界面布局</h3>
          <div class="setting-checkbox">
            <template v-for="layoutModel of layoutList" :key="layoutModel.value">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <div :class="['setting-checkbox-item', layoutModel.style]">
                    <div class="setting-layout-menu-doublerow-inner" />
                    <Icon
                      icon="emojione:white-heavy-check-mark"
                      class="setting-checkbox-item-select-icon"
                    />
                  </div>
                </template>
                {{ layoutModel.tips }}
              </n-tooltip>
            </template>
          </div>
        </n-drawer-content>
      </n-drawer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-content-luckHeader {
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--primary-bColor);
  background-color: var(--primary-bgColor);

  .n-button__border {
    border: none;
  }
}
.layout-content-left {
  display: flex;
  align-items: center;
}
.layout-content-right {
  display: flex;
  align-items: center;
}

.setting-checkbox {
  display: flex;
  margin-bottom: 20px;
}

.setting-checkbox-item {
  position: relative;
  width: 44px;
  height: 36px;
  margin-right: 16px;
  overflow: hidden;
  background-color: #ebeef1;
  border-radius: 2px;
  box-shadow: 0 1px 2.5px 0 rgb(0 0 0 / 18%);
  cursor: pointer;
}

.setting-checkbox-item::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 33%;
  height: 100%;
  background-color: #fff;
  content: '';
}

.setting-checkbox-item::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background-color: #fff;
  content: '';
}

.setting-layout-menu-doublerow-inner {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 33%;
  height: 100%;
  background-color: #fff;
  content: '';
}

.setting-layout-menu-classical {
  z-index: 1;
  background-color: #ebeef1;
  content: '';
}

.setting-layout-menu-classical::before {
  z-index: 1;
  background-color: #001529;
  content: '';
}

.setting-layout-menu-classical::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background-color: #fff;
  content: '';
}

.setting-layout-menu-doublerow {
  z-index: 1;
  background-color: #ebeef1;
  content: '';
}

.setting-layout-menu-doublerow::before {
  z-index: 1;
  width: 16%;
  background-color: #001529;
  content: '';
}

.setting-layout-menu-doublerow::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background-color: #fff;
  content: '';
}
</style>
