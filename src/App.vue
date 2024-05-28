<script setup lang="ts">
import { routes } from '@/router';

onActivated(() => {
  // 1. 调用时机为首次挂载
  // 2. 以及每次从缓存中被重新插入时
});
onDeactivated(() => {
  // 3. 在从 DOM 上移除、进入缓存
  // 4. 以及组件卸载时调用
});

function getKeepAliveComponents(): string[] | '' {
  // 获取所有缓存组件的名称
  // 首先使用 filter 方法过滤出所有 meta 属性中 keepAlive 为 true 的路由
  const filteredRoutes = routes.filter(route => route.meta && route.meta.keepAlive);
  // 然后使用 map 方法从这些路由中提取 name 属性
  const names = filteredRoutes.map(route => route.name) as string[] | '';
  return names.length ? names : '';
}
</script>

<template>
  <div>
    <n-message-provider>
      <!-- 缓存组件 -->
      <router-view v-slot="{ Component }">
        <keep-alive :include="getKeepAliveComponents()">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </n-message-provider>
  </div>
</template>
