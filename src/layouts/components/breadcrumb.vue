<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { useTabStore } from '@/store/modules/tab.ts';

const tabStore = useTabStore();
const route = useRoute();
const router = useRouter();

const Breadcrumb: Ref<any[]> = ref([]);

function tabSwitching(value: any) {
  if (value.children.length === 0) {
    router.push(value.path);
    tabStore.setActiveTab(value.path);
  }
  else {
    router.push(value.children[0].path);
    tabStore.setActiveTab(value.children[0].path);
  }
}

// 监听路由变化，更新面包屑导航
watch(
  () => route.path,
  () => {
    // eslint-disable-next-line ts/no-use-before-define
    updateBreadcrumb();
  }
);

const updateBreadcrumb = () => {
  Breadcrumb.value = route.matched;
};

onMounted(() => {
  updateBreadcrumb();
});
</script>

<template>
  <div>
    <n-breadcrumb>
      <n-breadcrumb-item v-for="item in Breadcrumb" :key="item.path" @click="tabSwitching(item)">
        {{ item.meta.title }}
      </n-breadcrumb-item>
    </n-breadcrumb>
  </div>
</template>

<style lang="less" scoped>

</style>
