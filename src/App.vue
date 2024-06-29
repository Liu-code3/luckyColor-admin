<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router';
import lockScreen from '@/components/lockScreen.vue';
import { useGlobalStore } from '@/store/layoutStore';
import router from '@/router';

const globalStore = useGlobalStore();
onActivated(() => {
  // 1. 调用时机为首次挂载
  // 2. 以及每次从缓存中被重新插入时
});
onDeactivated(() => {
  // 3. 在从 DOM 上移除、进入缓存
  // 4. 以及组件卸载时调用
});

function getKeepAliveComponents(routes: Array<RouteRecordRaw>): string[] | '' {
  const names: string[] = [];
  for (const route of routes) {
    if (route.meta && route.meta.keepAlive) {
      names.push(route.name as string);
    }
  }
  return names.length ? names : '';
}
</script>

<template>
  <div>
    <n-message-provider>
      <transition
        enter-active-class="animate__animated animate__bounceIn"
        leave-active-class="animate__animated animate__bounceOut"
      >
        <lockScreen
          v-if="globalStore.isLocked"
          @unlock="globalStore.updateIsLock(false);"
        />
      </transition>
      <!-- 缓存组件 -->
      <router-view v-slot="{ Component }">
        <keep-alive :include="getKeepAliveComponents(router.getRoutes())">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </n-message-provider>
  </div>
</template>
