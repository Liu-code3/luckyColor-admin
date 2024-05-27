<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import screenfull from 'screenfull';
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

const menuOptions = ref<TransformedMenuItem[]>([]);

const inverted = ref(false);
const router = useRouter();

// 标签
const tabArr = ref<TransformedMenuItem[]>([]);
const tab = ref('');

function handleUpdateValue(key: string, item: any) {
  router.push(key);
  tool.data.set('LAST_VIEWS_PATH', { key });
  tab.value = key;
  console.log(tabArr.value, '---');

  if (!tabArr.value.includes(item))
    tabArr.value.push(item);
}

const options = ref([
  {
    label: '用户资料',
    key: 'profile'
  },
  {
    label: '编辑用户资料',
    key: 'editProfile'
  },
  {
    label: '退出登录',
    key: 'logout'
  }
]);

// 刷新
function refresh() {
  location.reload();
}

// 全屏
function screenfullFn() {
  // screenfull.request(); // 全屏
  // screenfull.exit(); // 退出全屏
  screenfull.toggle(); // 全屏切换
}

function handleUpdateValues(value: string) {
  router.push(value);
  tab.value = value;
  tool.data.set('LAST_VIEWS_PATH', { value });
};
function handleClose(name: string | number) {
  tabArr.value = tabArr.value.filter((item) => {
    return item.key !== name;
  });
  tab.value = tabArr.value[tabArr.value.length - 1].key;
}

onMounted(() => {
  console.log(tool.data.get('LAST_VIEWS_PATH'));
  menuOptions.value = transformMenuData(menuData);

  if (tool.data.get('LAST_MUN')) {
    tabArr.value = tool.data.get('LAST_MUN') as TransformedMenuItem[];
  }
  else {
    menuOptions.value.forEach((item, index) => {
      if (index === 0) {
        if (!tabArr.value.includes(item)) {
          tool.data.set('LAST_VIEWS_PATH', { key: item.key });
          tab.value = item.key;
          tabArr.value.push(item);
          tool.data.set('LAST_MUN', tabArr.value);
          router.push(item.key);
        }
      }
    });
  }
});
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout has-sider>
        <n-layout-sider
          bordered show-trigger collapse-mode="width" :collapsed-width="64" :width="260"
          :native-scrollbar="false" :inverted="inverted"
        >
          <div class="logo-bar">
            <Icon class="mr-10px text-30px" icon="cryptocurrency-color:ltc" />
            <div class="pl-10px">
              luckyColor admin
            </div>
          </div>

          <n-menu
            v-model:value="tab" :inverted="inverted" :collapsed-width="64" :collapsed-icon-size="22"
            :options="menuOptions" class="h-91vh" @update:value="handleUpdateValue"
          />
        </n-layout-sider>
        <n-layout-content>
          <div class="layout-content-snowyHeader">
            <div>
              <n-breadcrumb>
                <n-breadcrumb-item>
                  北京总行
                </n-breadcrumb-item>
                <n-breadcrumb-item>
                  天津分行
                </n-breadcrumb-item>
                <n-breadcrumb-item>
                  平山道支行
                </n-breadcrumb-item>
              </n-breadcrumb>
            </div>
            <div class="layout-content-right">
              <Icon
                class="cursor-pointer text-20px" color="#595959" icon="lets-icons:full-alt-light"
                @click="screenfullFn"
              />
              <Icon
                class="mx-15px cursor-pointer text-20px" color="#595959" icon="mdi:circular-arrows"
                @click="refresh"
              />
              <n-dropdown :options="options">
                <n-button>
                  <n-avatar round size="medium" src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
                  <span class="ml-4px text-14px text-#606297">用户资料</span>
                </n-button>
              </n-dropdown>
            </div>
          </div>
          <n-tabs
            v-model:value="tab" default-value="oasis" type="card" closable @update:value="handleUpdateValues"
            @close="handleClose"
          >
            <template #prefix>
              <Icon class="text-12px" color="#595959" icon="ep:arrow-left" />
            </template>
            <n-tab-pane v-for="item in tabArr" :key="item.key" :name="item.key" :tab="item.label" />
            <template #suffix>
              <Icon class="text-12px" color="#595959" icon="ep:arrow-right" />
            </template>
          </n-tabs>
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
}

.layout-content-snowyHeader {
  height: 60px;
  background-color: #fff;
  border-bottom: solid #dcdfe6 1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layout-content-right {
  display: flex;
  align-items: center;

  :deep(.n-button) {
    border: none !important;
  }
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
