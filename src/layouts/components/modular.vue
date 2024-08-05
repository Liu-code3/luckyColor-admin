<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';
import tool from '@/utils/tool.ts';
import { useMenuStore } from '@/store/modules/menu.ts';

const route = useRoute();
const menuStore = useMenuStore();
const switchModulesList = ref<LayoutT.MenuItem[]>([]);
const selectedKeys = ref<string[]>([ '' ]);
const identification = ref<string>('');

// 监听路由变化并初始化数据
watch(() => route.fullPath, () => {
  switchModulesList.value = tool.data.get('MENU') as LayoutT.MenuItem[];
  selectedKeys.value = [ route.fullPath ];
  identification.value = getBeforeSecondSlash(route.fullPath);
  switchModulesList.value.forEach((item) => {
    if (item.path === getBeforeSecondSlash(route.fullPath)) {
      menuStore.menuOptions = menuStore.transformMenuData(item.children);
    }
  });
}, { immediate: true });

// 获取路径中的第二个斜杠之前的部分
function getBeforeSecondSlash(url: string): string {
  const secondSlashIndex = url.indexOf('/', 1);
  if (secondSlashIndex !== -1) {
    return url.substring(0, secondSlashIndex);
  }
  return url;
}
</script>

<template>
  <div class="modular_box">
    <template v-for="item in switchModulesList" :key="item.path">
      <div
        class="modular_each cursor-pointer"
        :class="{ modular_select: identification.includes(String(item.path)) }"
      >
        <Icon :icon="item.icon" />
        <div>
          {{ item.title }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
.modular_each {
  width: 70px;
  color: #a6adb4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 20px;
  border-radius: 10%;
  padding: 10px 0;

  div {
    font-size: 13px;
    margin-top: 4px;
  }
}

.modular_each:hover {
  color: #ffffff;
}

.modular_select {
  color: #ffffff;
  background-color: #4e88f3;
}
</style>
