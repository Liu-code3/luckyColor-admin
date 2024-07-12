<script lang="ts" setup>
import type { RouteLocationMatched } from 'vue-router';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useTabStore } from '@/store/modules/tab.ts';
import { useIconRender } from '@/hooks/iconRender.ts';

const iconRender = useIconRender();

const tabStore = useTabStore();
const route = useRoute();
const router = useRouter();

const Breadcrumb: Ref<RouteLocationMatched[]> = ref([]);

function tabSwitching(value: RouteLocationMatched) {
  if (value.children.length === 0) {
    router.push(value.path);
    tabStore.setActiveTab(value.path);
  }
  else {
    router.push(value.children[0].path);
    tabStore.setActiveTab(value.children[0].path);
  }
}

const updateBreadcrumb = () => {
  Breadcrumb.value = route.matched;
};

const handleSelect = (key: string) => {
  router.push(key);
  tabStore.setActiveTab(key);
};

// 监听路由变化，更新面包屑导航
watch(
  () => route.path,
  () => {
    updateBreadcrumb();
  }
);

onMounted(() => {
  updateBreadcrumb();
});
</script>

<template>
  <div>
    <n-breadcrumb>
      <n-breadcrumb-item
        v-for="item in Breadcrumb"
        :key="item.path"
        @click="tabSwitching(item)"
      >
        <n-dropdown
          :options="item.children.map(child => ({ key: child.path, label: child.meta?.title, icon: iconRender(child.meta?.icon as '') }))"
          @select="handleSelect"
        >
          <div class="trigger">
            <Icon :icon="item.meta?.icon" class="mr-5px text-18px" /> {{ item.meta.title }}
          </div>
        </n-dropdown>
      </n-breadcrumb-item>
    </n-breadcrumb>
  </div>
</template>

<style lang="less" scoped>
.trigger {
  padding: 4px;
  margin: -4px;
  border-radius: inherit;
  display: flex;
  align-items: center;
}
</style>
