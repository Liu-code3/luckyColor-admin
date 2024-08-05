<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useGlobalStore } from '@/store/modules/global.ts';
import { colorList } from '@/config/setting.ts';

const props = defineProps({
  settingDrawer: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits([ 'updateSettingDrawer' ]);

const isDrawer = computed({
  get: () => props.settingDrawer,
  set: (val) => {
    emits('updateSettingDrawer', val);
  }
});

const globalStore = useGlobalStore();

// 设置整体风格主题
const layoutList = [
  {
    tips: '经典',
    value: 'normal',
    style: 'setting-layout-menu-classical'
  },
  {
    tips: '内容全屏',
    value: 'empty',
    style: 'setting-layout-menu-double-row'
  }
];
const setSideStyle = (model: string) => {
  globalStore.updateLayout(model);
};

// 主题色
const tagColor = (color: string) => {
  globalStore.setPrimaryColor(color);
};
</script>

<template>
  <div>
    <n-drawer v-model:show="isDrawer" :width="480">
      <n-drawer-content :native-scrollbar="false">
        <h3>整体界面布局</h3>
        <div class="setting-checkbox">
          <template v-for="layoutModel of layoutList" :key="layoutModel.value">
            <n-tooltip trigger="hover">
              <template #trigger>
                <div
                  :class="['setting-checkbox-item', layoutModel.style]"
                  @click="setSideStyle(layoutModel.value)"
                >
                  <div class="setting-layout-menu-double-row-inner" />
                  <template v-if="globalStore.layout === layoutModel.value">
                    <Icon
                      icon="emojione:white-heavy-check-mark"
                      class="setting-checkbox-item-select-icon"
                    />
                  </template>
                </div>
              </template>
              {{ layoutModel.tips }}
            </n-tooltip>
          </template>
        </div>

        <n-divider />

        <div>
          <h3>主题色</h3>
          <div class="setting-theme-color-colorBlock">
            <template
              v-for="item of colorList" :key="item.color"
            >
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-tag
                    class="h-5 w-5"
                    :color="{ color: item.color }"
                    @click="tagColor(item.color)"
                  >
                    <template v-if="globalStore.primaryColor === item.color">
                      <Icon
                        icon="emojione:white-heavy-check-mark"
                        class="setting-checkbox-item-select-icon"
                      />
                    </template>
                  </n-tag>
                </template>
                {{ item.key }}
              </n-tooltip>
            </template>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped lang="scss">
.setting-checkbox {
  display: flex;
  margin-bottom: 20px;
}

.setting-checkbox-item {
  position: relative;
  width: 44px;
  height: 36px;
  margin-right: 16px;
  overflow: hidden;
  background-color: #ebeef1;
  border-radius: 2px;
  box-shadow: 0 1px 2.5px 0 rgb(0 0 0 / 18%);
  cursor: pointer;
}

.setting-checkbox-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 33%;
  height: 100%;
  background-color: #fff;
}

.setting-checkbox-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background-color: #fff;
}

.setting-layout-menu-double-row-inner {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 33%;
  height: 100%;
  background-color: #fff;
}

.setting-layout-menu-classical {
  z-index: 1;
  background-color: #ebeef1;
}

.setting-layout-menu-classical::before {
  content: '';
  z-index: 1;
  background-color: #001529;
}

.setting-layout-menu-classical::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background-color: #fff;
}

.setting-layout-menu-double-row {
  content: '';
  z-index: 1;
  background-color: #ebeef1;
}

.setting-layout-menu-double-row::before {
  content: '';
  z-index: 1;
  width: 16%;
  background-color: #001529;
}

.setting-layout-menu-double-row::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background-color: #fff;
}

.setting-checkbox-item-select-icon {
  position: absolute;
  right: 8px;
  bottom: 8px;
  color: #1890ff;
  font-weight: 700;
  font-size: 14px;
  pointer-events: none;
}

.setting-theme-color-colorBlock {
  display: flex;
  flex-direction: row;
  gap: 15px;
  cursor: pointer;
}
</style>
