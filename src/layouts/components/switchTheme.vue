<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { Icon } from '@iconify/vue';
import { useGlobalStore } from '@/store/modules/global.ts';

const globalStore = useGlobalStore();
const isDark = useDark();

function toggleTheme(event: Event) {
  const { clientX, clientY } = event as MouseEvent;
  const maxRadius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  );
  const style = document.documentElement.style;
  style.setProperty('--circle-x', `${clientX}px`);
  style.setProperty('--circle-y', `${clientY}px`);
  style.setProperty('--circle-r', `${maxRadius}px`);

  function handler() {
    globalStore.toggleDark();
    useToggle(isDark)();
  }

  // 检查 startViewTransition 是否存在并且是一个函数
  if ('startViewTransition' in document && typeof document.startViewTransition === 'function') {
    document.startViewTransition(handler);
  }
  else {
    handler();
  }
}
</script>

<template>
  <Icon
    :icon="globalStore.isDark ? 'ph:moon' : 'ph:sun'"
    class="h-5 w-5"
    @click="toggleTheme"
  />
</template>
