<script lang="ts" setup>
import type { RouteRecord, RouteRecordRaw } from 'vue-router';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useTabStore } from '@/store/modules/tab.ts';
import { useIconRender } from '@/hooks/iconRender.ts';

const iconRender = useIconRender();

const tabStore = useTabStore();
const route = useRoute();
const router = useRouter();

const Breadcrumb: Ref<RouteRecord[]> = ref([]);

function tabSwitching(value: RouteRecord) {
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
  Breadcrumb.value = [ ...route.matched ];
};

const onDropDownOptions = (children: RouteRecordRaw[]) => {
  children.map((child) => {
    const icon = isString(child.meta?.icon);
    return { key: child.path, label: child.meta?.title, icon: iconRender(icon) };
  });
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
  },
  {
    immediate: true
  }
);

function isString<T>(str: T): string {
  return typeof str === 'string' ? str : '';
}
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
          :options="onDropDownOptions(item.children)"
          @select="handleSelect"
        >
          <div class="trigger">
            <Icon :icon="isString(item.meta?.icon)" class="mr-5px text-18px" />
            {{ item.meta.title }}
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
