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
    class="h-5 w-5 color-primary"
    @click="toggleTheme"
  />
</template>

<style scoped lang="scss">
.toggle {
  background-color: rgba(24, 160, 88, 0.5);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 0 50px 20px rgba(0, 0, 0, 0.1);
  line-height: 1;
}

.input {
  display: none;
}

.icon {
  grid-column: 1 / 1;
  grid-row: 1 / 1;
  transition: transform 500ms;
}

.icon--moon {
  transition-delay: 200ms;
  color: black;
}

.icon--sun {
  transform: scale(0);
  color: yellow;
}

#switch:checked + .icon--moon {
  transform: rotate(360deg) scale(0);
}

#switch:checked ~ .icon--sun {
  transition-delay: 200ms;
  transform: scale(1) rotate(360deg);
}
</style>
