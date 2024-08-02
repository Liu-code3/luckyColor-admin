<script setup lang="ts">
import { useRoute } from 'vue-router';
import { darkTheme, dateZhCN, zhCN } from 'naive-ui';
import lockScreen from '@/components/lockScreen.vue';
import { useGlobalStore } from '@/store/modules/global.ts';
import { isString } from '@/utils/is.ts';

const route = useRoute();
const globalStore = useGlobalStore();
if (globalStore.layout === 'default') {
  globalStore.updateLayout('default');
}
const Layout = computed(() => {
  if (!route.matched.length) {
    return null;
  }
  return getLayout(isString(route.meta.layout) || globalStore.layout);
});

const layouts = new Map();
function getLayout(name: string) {
  // 利用map将加载过的layout缓存起来，防止重新加载layout导致页面闪烁
  if (layouts.get(name)) {
    return layouts.get(name);
  }
  const layout = markRaw(defineAsyncComponent(() => import(`@/layouts/${name}/index.vue`)));
  layouts.set(name, layout);
  return layout;
}

watchEffect(() => {
  globalStore.setThemeColor(globalStore.primaryColor, globalStore.isDark);
});

onActivated(() => {
  // 1. 调用时机为首次挂载
  // 2. 以及每次从缓存中被重新插入时
});
onDeactivated(() => {
  // 3. 在从 DOM 上移除、进入缓存
  // 4. 以及组件卸载时调用
});
</script>

<template>
  <div>
    <n-config-provider
      class="h-full w-full"
      :locale="zhCN"
      :date-locale="dateZhCN"
      :theme="globalStore.isDark ? darkTheme : null"
      :theme-overrides="globalStore.naiveThemeOverrides"
    >
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
        <router-view v-if="Layout" v-slot="{ Component }">
          <component :is="Layout">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </component>
        </router-view>
      </n-message-provider>
    </n-config-provider>
  </div>
</template>
