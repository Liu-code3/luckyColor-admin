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

function xuanzhong(key: string | number) {
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
  // tool.data.remove('TOKEN');
  router.push('/login');
  message.success(
    '退出登录成功'
  );
}

function handleLinkClick(link: string) {
  window.open(link, '_blank');
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
        class="mr-10px cursor-pointer text-5 color-primary"
        icon="mdi:circular-arrows"
        @click="refresh"
      />

      <n-dropdown :options="options" @select="xuanzhong">
        <div class="flex cursor-pointer items-center">
          <n-avatar round size="medium" src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
          <div class="ml-1px flex-shrink-0 flex-col items-center">
            <span class="ml-4px text-14px text-primary">用户资料</span>
          </div>
        </div>
      </n-dropdown>
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
</style>
