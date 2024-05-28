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

const menuOptions: TransformedMenuItem[] = transformMenuData(menuData);

const inverted = ref(false);
const router = useRouter();

function handleUpdateValue(key: string, item: string) {
  console.log(key);
  console.log(item);
  router.push(key);
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

const tab = ref([1, 2, 3, 4, 5, 7, 8, 9, 0, 1, 23, 4, 6, 7, 8, 98, 90, 0, 7, 5, 45, 4, 3, 3, 2, 5, 6, 7]);

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
          :width="260"
          :native-scrollbar="false"
          :inverted="inverted"
        >
          <div class="logo-bar">
            <div class="logo" /> luckyColor admin
          </div>

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
              <Icon class="cursor-pointer text-20px" color="#595959" icon="lets-icons:full-alt-light" @click="screenfullFn" />
              <Icon class="mx-15px cursor-pointer text-20px" color="#595959" icon="mdi:circular-arrows" @click="refresh" />
              <n-dropdown :options="options">
                <n-button>
                  <n-avatar
                    round
                    size="medium"
                    src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
                  />
                  <span class="ml-4px text-14px text-#606297">用户资料</span>
                </n-button>
              </n-dropdown>
            </div>
          </div>
          <n-tabs default-value="oasis" type="card" closable>
            <template #prefix>
              <Icon class="text-12px" color="#595959" icon="ep:arrow-left" />
            </template>
            <n-tab-pane v-for="item in tab" :key="item" :name="item" :tab="item" />
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
  .logo {
    width: 20px;
    height: 20px;
    background-color: red;
    margin: 0 20px 0 20px;
  }
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
