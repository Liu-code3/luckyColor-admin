<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import NavMenu from './components/NavMenu.vue';
import Tags from './components/tags.vue';
import Userbar from './components/userbar.vue';
import tool from '@/utils/tool';
import { useIconRender } from '@/hooks/iconRender';

const iconRender = useIconRender();
const router = useRouter();

// 路由传换为菜单
function transformMenuData(data: LayoutT.MenuItem[]): LayoutT.TransformedMenuItem[] {
  return data.map((item) => {
    const newItem: LayoutT.TransformedMenuItem = {
      pid: item.pid,
      id: item.id,
      label: item.title,
      key: item.path,
      icon: iconRender(item.icon)
    };

    if (item.children && item.children.length > 0)
      newItem.children = transformMenuData(item.children);

    return newItem;
  });
}

// 标签
const tabsList = ref<LayoutT.TransformedMenuItem[]>([]);
const defaultLabels = ref('');

// 菜单
const menuOptions = ref<LayoutT.TransformedMenuItem[]>([]);

// 路由菜单
const menuData: LayoutT.MenuItem[] = tool.data.get('MENU') as LayoutT.MenuItem[];

// 默认加载
function defaultLoading() {
  menuOptions.value = transformMenuData(menuData);
  const mun = tool.data.get('LAST_MUN');
  if (mun) {
    tabsList.value = tool.data.get('LAST_MUN') as LayoutT.TransformedMenuItem[];
    const obj = tool.data.get('LAST_VIEWS_PATH') as LayoutT.Obj;
    defaultLabels.value = obj.key;
  }
  else {
    menuOptions.value.forEach((item, index) => {
      if (index === 0) {
        const exists = tabsList.value.some(v => v.key === item.key);
        if (!exists) {
          tool.data.set('LAST_VIEWS_PATH', { key: item.key });
          defaultLabels.value = item.key;
          tabsList.value.push(item);
          tool.data.set('LAST_MENU', tabsList.value);
          router.push(item.key);
        }
      }
    });
  }
}

onMounted(() => {
  defaultLoading();
});

function defaultLabelsFn(val: string) {
  defaultLabels.value = val;
}

function tabsListFn(val: LayoutT.TransformedMenuItem[]) {
  tabsList.value = val;
}
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout has-sider>
        <n-layout-sider
          bordered show-trigger collapse-mode="width" :collapsed-width="64" :width="260"
          :native-scrollbar="false"
        >
          <div class="logo-bar">
            <Icon class="mr-14px text-30px" icon="cryptocurrency-color:ltc" />
            <div class="pl-9px">
              luckyColor admin
            </div>
          </div>
          <NavMenu
            v-model:menuOptions="menuOptions" v-model:tabsList="tabsList" v-model:defaultLabels="defaultLabels"
            @default-labels-fn="defaultLabelsFn" @tabs-list-fn="tabsListFn"
          />
        </n-layout-sider>
        <n-layout-content>
          <!-- 头部 -->
          <Userbar />
          <!-- 标签页 -->
          <Tags
            v-model:tabsList="tabsList" v-model:defaultLabels="defaultLabels" @default-labels-fn="defaultLabelsFn"
            @tabs-list-fn="tabsListFn"
          />
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style lang="less">
.n-scrollbar-content {
  border-right: solid #dcdfe6 2px;
}

.logo-bar {
  width: 220px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin: 0 0 0 10px;
}

.n-tabs {
  height: 50px;
  background-color: #fff;
  padding: 8px;
  border-bottom: solid #dcdfe6 1px;

  .n-tabs-nav__prefix,
  .n-tabs-nav__suffix,
  .n-tabs-pad,
  .n-tabs-wrapper {
    border: none !important;
  }

  .n-tab-pane {
    display: none;
  }

  .n-tabs-tab {
    height: 34px;
    border: #dcdfe6 solid 1px !important;
    background-color: #fff !important;
    border-radius: 4px !important;
  }

  .n-tabs-tab--active {
    border: #588ff4 solid 1px !important;
    color: #588ff4 !important;
    background-color: rgba(88, 143, 244, 0.1) !important;

    .n-base-icon {
      color: #588ff4 !important;
    }
  }
}

.n-layout-scroll-container {
  background-color: #f6f8f9;
}
</style>
