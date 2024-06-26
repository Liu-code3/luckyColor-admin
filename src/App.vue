<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router';
import lockScreen from '@/components/lockScreen.vue';
import { useGlobalStore } from '@/store/layoutStore';
import { routes } from '@/router';

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
  function recurse(routes: Array<RouteRecordRaw>) {
    for (const route of routes) {
      if (route.meta && route.meta.keepAlive && route.name) {
        names.push(route.name as string); // <string>route.name 这样预测类型会被识别为标签
      }
      if (route.children) {
        names.push(route.name as string);
      }
    }
  }

  recurse(routes);

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
        <keep-alive :include="getKeepAliveComponents(routes)">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </n-message-provider>
  </div>
</template>
