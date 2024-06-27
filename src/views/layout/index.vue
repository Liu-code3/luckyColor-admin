<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import screenfull from 'screenfull';
import { useMessage } from 'naive-ui';
import tool from '@/utils/tool';
import { useIconRender } from '@/hooks/iconRender';
import { useGlobalStore } from '@/store/layoutStore';
import SwitchTheme from '@/views/layout/components/switchTheme.vue';
import { setCssVar } from '@/utils/setCssVar.ts';

const message = useMessage();
const globalStore = useGlobalStore();
const iconRender = useIconRender();
const router = useRouter();
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
  pid: number;
  id: number;
  label: string;
  key: string;
  icon: any;
  children?: TransformedMenuItem[];
}

interface Obj {
  [key: string]: string;
}

const switchModel: TFn.voidFn = () => {
  const localModel = tool.data.get('themeModel') ?? true;
  const dartModel = [
    {
      prop: '--theme-color',
      val: '#333'
    },
    {
      prop: '--theme-background',
      val: '#fff'
    }
  ].map(item => ({ ...item, dom: document.documentElement }));

  const lightModel = [
    {
      prop: '--theme-color',
      val: '#eee'
    },
    {
      prop: '--theme-background',
      val: '#fff'
    }
  ].map(item => ({ ...item, dom: document.documentElement }));
  localModel ? setCssVar(dartModel) : setCssVar(lightModel);
};

// 路由菜单
const menuData: MenuItem[] = tool.data.get('MENU') as MenuItem[];

// 路由传换为菜单
function transformMenuData(data: MenuItem[]): TransformedMenuItem[] {
  return data.map((item) => {
    const newItem: TransformedMenuItem = {
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

// 菜单
const menuOptions = ref<TransformedMenuItem[]>([]);

// 反转
const inverted = ref(false);

// 标签
const tabsList = ref<TransformedMenuItem[]>([]);
const defaultLabels = ref('');

// 切换菜单
function handleUpdateValue(key: string, item: any) {
  router.push(key);
  tool.data.set('LAST_VIEWS_PATH', { key });
  defaultLabels.value = key;
  const exists = tabsList.value.some(item => item.key === key);
  if (!exists) {
    tabsList.value.push(item);
    tool.data.set('LAST_MENU', tabsList.value);
  }
}

const options = ref([
  {
    label: '退出登录',
    key: 'signOut'
  }
]);

// 锁屏
function JumpLock() {
  globalStore.updateIsLock(true);
}

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

// 标签页切换
function tabSwitching(value: any) {
  router.push(value);
  defaultLabels.value = value;
  tool.data.set('LAST_VIEWS_PATH', { key: value });
}

// 关闭标签
function handleClose(name: string | number) {
  tabsList.value = tabsList.value.filter((item) => {
    return item.key !== name;
  });
  defaultLabels.value = tabsList.value[tabsList.value.length - 1].key;
}

// 默认加载
function defaultLoading() {
  menuOptions.value = transformMenuData(menuData);
  if (tool.data.get('LAST_MENU')) {
    tabsList.value = tool.data.get('LAST_MENU') as TransformedMenuItem[];
    const obj = tool.data.get('LAST_VIEWS_PATH') as Obj;
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
  // 主题模式
  switchModel();
});

function xuanzhong(key: string | number) {
  if (key === 'signOut')
    signOut();
}

// 退出登录
function signOut() {
  router.push('/login');
  message.success(
    '退出登录成功'
  );
  tool.data.clear();
}
</script>

<template>
  <n-space vertical>
    <n-layout has-sider>
      <n-layout-sider
        bordered show-trigger collapse-mode="width" :collapsed-width="64" :width="260"
        :native-scrollbar="false" :inverted="inverted"
      >
        <div class="logo-bar">
          <Icon class="mr-14px text-30px" icon="cryptocurrency-color:ltc" />
          <div class="pl-9px">
            luckyColor admin
          </div>
        </div>

        <n-menu
          v-model:value="defaultLabels"
          :inverted="inverted"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          class="n-menu-height"
          @update:value="handleUpdateValue"
        />
      </n-layout-sider>
      <n-layout-content>
        <div class="layout-content-snowyHeader">
          <div class="flex flex-row items-center">
            <SwitchTheme @toggle-theme="switchModel" />
            <Icon
              class="mx-3 text-5"
              icon="tabler:lock-filled"
              @click="JumpLock"
            />
            <Icon
              class="cursor-pointer text-5" color="#595959" icon="lets-icons:full-alt-light"
              @click="screenfullFn"
            />
            <Icon
              class="mx-3 cursor-pointer text-5" color="#595959" icon="mdi:circular-arrows"
              @click="refresh"
            />
            <n-dropdown :options="options" class="custom-dropdown" @select="xuanzhong">
              <n-button>
                <n-avatar round size="medium" src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
                <span class="ml-1 text-14px text-#606297">用户资料</span>
              </n-button>
            </n-dropdown>
          </div>
        </div>

        <n-tabs
          v-model:value="defaultLabels" default-value="oasis" type="card" closable @update:value="tabSwitching"
          @close="handleClose"
        >
          <template #prefix>
            <Icon class="text-12px" color="#595959" icon="ep:arrow-left" />
          </template>
          <n-tab-pane v-for="item in tabsList" :key="item.key" :name="item.key" :tab="item.label" />
          <template #suffix>
            <Icon class="text-12px" color="#595959" icon="ep:arrow-right" />
          </template>
        </n-tabs>
        <div class="layout-content-main">
          <router-view />
        </div>
      </n-layout-content>
    </n-layout>
  </n-space>
</template>

<style lang="less">
.n-scrollbar-content {
  border-right: solid #dcdfe6 2px;
  background-color: var(--theme-background);
  transition: background-color 800ms;
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

.layout-content-snowyHeader {
  height: 60px;
  border-bottom: solid #dcdfe6 1px;
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 0 20px;
  .n-button__border {
    border: none;
  }
}

.layout-content-right {
  display: flex;
  align-items: center;
}

.n-menu-height {
  height: calc(100vh - 61px);
}

.n-tabs {
  height: 50px;
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
  background-color: var(--theme-background);
  transition: background-color 800ms;
}

.layout-content-main {
  height: calc(100vh - 111px);
  overflow-y: auto;
}

.layout-content-main::-webkit-scrollbar {
  display: none;
}
</style>
