<script lang="ts" setup>
import { useRouter } from 'vue-router';
import tool from '@/utils/tool';
import { useIconRender } from '@/hooks/iconRender';

const iconRender = useIconRender();
interface MenuItem {
  pid: number;
  id: number;
  title: string;
  type: number;
  path: string;
  key: string;
  icon: string;
  children?: MenuItem[];
}

interface TransformedMenuItem {
  label: string;
  key: string;
  icon: any;
  children?: TransformedMenuItem[];
}

const menuData: MenuItem[] = tool.data.get('MENU') as MenuItem[];

function transformMenuData(data: MenuItem[]): TransformedMenuItem[] {
  return data.map((item) => {
    const newItem: TransformedMenuItem = {
      label: item.title,
      key: item.path,
      icon: iconRender(item.icon)
    };
    if (item.children && item.children.length > 0)
      newItem.children = transformMenuData(item.children);

    return newItem;
  });
}
console.log(transformMenuData(menuData), '菜单渲染');

const menuOptions: TransformedMenuItem[] = transformMenuData(menuData);

const inverted = ref(false);
const router = useRouter();

function handleUpdateValue(key: string, item: string) {
  console.log(item);
  router.push(key);
}
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout has-sider>
        <n-layout-sider
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="64"
          :width="220"
          :native-scrollbar="false"
          :inverted="inverted"
        >
          <div style="height: 60px; " />

          <n-menu
            :inverted="inverted"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
            class="h-91vh"
            @update:value="handleUpdateValue"
          />
        </n-layout-sider>
        <n-layout-content>
          <div style="height: 60px; " />
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>
