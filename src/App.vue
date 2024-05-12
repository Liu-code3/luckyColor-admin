<template>
  <div>
    <!-- 缓存组件-->
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" v-if="$route.meta.keepAlive" :key="$route.path" />
      </keep-alive>
    </router-view>

    <router-view v-slot="{ Component }">
      <component :is="Component" v-if="!$route.meta.keepAlive" :key="$route.path" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
let $route = useRoute()

onActivated(() => {
  //1. 调用时机为首次挂载
  //2. 以及每次从缓存中被重新插入时
});

onDeactivated(() => {
  //3. 在从 DOM 上移除、进入缓存
  //4. 以及组件卸载时调用
});
</script>
