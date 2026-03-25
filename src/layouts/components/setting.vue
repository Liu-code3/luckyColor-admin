<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { colorList } from '@/config/setting.ts';
import { useMenuStore } from '@/store/modules/menu.ts';
import { useGlobalStore } from '@/store/modules/global.ts';

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
const menuStore = useMenuStore();
const showThemeColorPicker = ref(false);

const layoutList = [
  {
    tips: '左侧模式',
    value: 'normal',
    style: 'setting-layout-menu-left',
    description: '经典后台布局，菜单固定在左侧，适合信息层级更深的 SaaS 场景。'
  },
  {
    tips: '顶部模式',
    value: 'top',
    style: 'setting-layout-menu-top',
    description: '一级菜单放在顶部，页面更开阔，适合模块相对平级的工作台。'
  },
  {
    tips: '混合模式',
    value: 'modular',
    style: 'setting-layout-menu-mixed',
    description: '模块导航和侧边菜单分层展示，兼顾业务分组与操作效率。'
  }
];

const sidebarThemeList = [
  {
    label: '深色侧边栏',
    value: 'dark' as const,
    description: '对比更强，适合高密度后台导航。'
  },
  {
    label: '浅色侧边栏',
    value: 'light' as const,
    description: '更轻盈，适合长时间浏览与管理操作。'
  },
  {
    label: '主题色侧边栏',
    value: 'theme' as const,
    description: '跟随系统主色，视觉更统一。'
  }
];

const lockSwitchValue = computed({
  get: () => globalStore.showLockEntry,
  set: (value: boolean) => {
    globalStore.updateShowLockEntry(value);
  }
});

const currentThemePresetLabel = computed(() => {
  return colorList.find(item => item.color === globalStore.primaryColor)?.key || '自定义';
});

function setLayoutMode(layout: string) {
  globalStore.updateLayout(layout);
  menuStore.defaultLoading();
}

function handleThemeColorChange(color: string | null) {
  if (!color)
    return;

  globalStore.setPrimaryColor(color);
}

function pickPresetColor(color: string) {
  globalStore.setPrimaryColor(color);
}

function updateSidebarTheme(theme: 'dark' | 'light' | 'theme') {
  globalStore.updateSidebarTheme(theme);
}

function toggleThemeColorPicker() {
  showThemeColorPicker.value = !showThemeColorPicker.value;
}
</script>

<template>
  <n-drawer v-model:show="isDrawer" :width="420">
    <n-drawer-content :native-scrollbar="false" title="全局设置">
      <div class="setting-panel">
        <section class="setting-section setting-section--hero">
          <div class="setting-hero">
            <div>
              <span class="setting-hero__badge">LuckyColor</span>
              <h3>布局与视觉风格</h3>
              <p>在这里统一调整后台布局、主题色和界面辅助能力，让系统风格更贴近实际使用习惯。</p>
            </div>
            <div class="setting-hero__preview">
              <span>当前布局</span>
              <strong>
                {{ layoutList.find(item => item.value === globalStore.layout)?.tips || '左侧模式' }}
              </strong>
            </div>
          </div>
        </section>

        <section class="setting-section">
          <div class="setting-section__header">
            <h3>布局设置</h3>
            <span>支持左侧、顶部、混合三种成熟后台布局模式</span>
          </div>

          <div class="setting-layout-grid">
            <button
              v-for="layoutModel in layoutList"
              :key="layoutModel.value"
              type="button"
              class="setting-layout-card"
              :class="{ 'setting-layout-card--active': globalStore.layout === layoutModel.value }"
              @click="setLayoutMode(layoutModel.value)"
            >
              <div :class="['setting-layout-card__preview', layoutModel.style]">
                <div class="setting-layout-card__preview-body" />
              </div>
              <div class="setting-layout-card__content">
                <div class="setting-layout-card__title">
                  <strong>{{ layoutModel.tips }}</strong>
                  <Icon
                    v-if="globalStore.layout === layoutModel.value"
                    icon="mdi:check-circle"
                    class="setting-layout-card__icon"
                  />
                </div>
                <span>{{ layoutModel.description }}</span>
              </div>
            </button>
          </div>
        </section>

        <section class="setting-section">
          <div class="setting-section__header">
            <h3>主题色</h3>
            <span>将当前主题色、自定义调色和预设品牌色收在同一个区域里，选择更直观</span>
          </div>

          <div class="setting-color-stage">
            <button
              type="button"
              class="setting-color-picker"
              :class="{ 'setting-color-picker--expanded': showThemeColorPicker }"
              @click="toggleThemeColorPicker"
            >
              <div class="setting-color-picker__leading">
                <span class="setting-color-picker__swatch" :style="{ background: globalStore.primaryColor }" />
              </div>
              <div class="setting-color-picker__meta">
                <div class="setting-color-picker__title">
                  <strong>{{ globalStore.primaryColor }}</strong>
                  <span class="setting-color-picker__tag">{{ currentThemePresetLabel }}</span>
                </div>
                <span>用于按钮、菜单选中态与关键交互反馈，建议保持清晰稳定的品牌识别。</span>
              </div>
              <div class="setting-color-picker__actions">
                <span>{{ showThemeColorPicker ? '收起调色板' : '展开调色板' }}</span>
                <Icon
                  icon="mdi:chevron-down"
                  class="setting-color-picker__action"
                  :class="{ 'setting-color-picker__action--expanded': showThemeColorPicker }"
                />
              </div>
            </button>

            <div v-show="showThemeColorPicker" class="setting-color-picker__panel">
              <div class="setting-color-picker__panel-header">
                <strong>自定义主题色</strong>
                <span>支持精细挑选主色，确认后会同步更新系统主交互色。</span>
              </div>
              <n-color-picker
                :value="globalStore.primaryColor"
                :actions="['confirm']"
                size="large"
                @update:value="handleThemeColorChange"
              />
            </div>
          </div>

          <div class="setting-theme-swatches">
            <button
              v-for="item in colorList"
              :key="item.color"
              type="button"
              class="setting-theme-swatches__item"
              :class="{ 'setting-theme-swatches__item--active': globalStore.primaryColor === item.color }"
              @click="pickPresetColor(item.color)"
            >
              <span class="setting-theme-swatches__dot" :style="{ background: item.color }" />
              <div class="setting-theme-swatches__meta">
                <strong>{{ item.key }}</strong>
                <span>{{ item.color }}</span>
              </div>
              <Icon
                v-if="globalStore.primaryColor === item.color"
                icon="mdi:check-circle"
                class="setting-theme-swatches__icon"
              />
            </button>
          </div>
        </section>

        <section class="setting-section">
          <div class="setting-section__header">
            <h3>界面功能</h3>
            <span>标签、水印和辅助模式都可以按需单独控制</span>
          </div>

          <div class="setting-switch-list">
            <div class="setting-switch-item">
              <div>
                <strong>显示标签功能</strong>
                <span>控制多页签导航栏的显示与隐藏</span>
              </div>
              <n-switch :value="globalStore.showTabs" @update:value="(value: boolean) => globalStore.updateShowTabs(value)" />
            </div>

            <div class="setting-switch-item">
              <div>
                <strong>显示水印功能</strong>
                <span>在后台页面上叠加全局水印</span>
              </div>
              <n-switch :value="globalStore.showWatermark" @update:value="(value: boolean) => globalStore.updateShowWatermark(value)" />
            </div>

            <div class="setting-switch-item">
              <div>
                <strong>灰色模式</strong>
                <span>整站切换为灰阶显示</span>
              </div>
              <n-switch :value="globalStore.grayMode" @update:value="(value: boolean) => globalStore.updateGrayMode(value)" />
            </div>

            <div class="setting-switch-item">
              <div>
                <strong>色弱模式</strong>
                <span>增强特殊视觉场景下的可辨识度</span>
              </div>
              <n-switch :value="globalStore.colorWeakMode" @update:value="(value: boolean) => globalStore.updateColorWeakMode(value)" />
            </div>

            <div class="setting-switch-item">
              <div>
                <strong>锁屏功能</strong>
                <span>控制用户头像旁的锁屏入口是否显示</span>
              </div>
              <n-switch v-model:value="lockSwitchValue" />
            </div>
          </div>
        </section>

        <section class="setting-section">
          <div class="setting-section__header">
            <h3>侧边栏配色</h3>
            <span>切换侧边栏明暗风格，或跟随主题色形成统一视觉</span>
          </div>

          <div class="setting-sidebar-grid">
            <button
              v-for="item in sidebarThemeList"
              :key="item.value"
              type="button"
              class="setting-sidebar-card"
              :class="{ 'setting-sidebar-card--active': globalStore.sidebarTheme === item.value }"
              @click="updateSidebarTheme(item.value)"
            >
              <div class="setting-sidebar-card__preview" :class="`setting-sidebar-card__preview--${item.value}`">
                <div class="setting-sidebar-card__preview-main" />
              </div>
              <div class="setting-sidebar-card__body">
                <strong>{{ item.label }}</strong>
                <span>{{ item.description }}</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="scss">
.setting-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 16px;
}

.setting-section {
  padding: 18px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.04);
}

.setting-section--hero {
  padding: 0;
  overflow: hidden;
}

.setting-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(120px, 160px);
  gap: 16px;
  padding: 22px 20px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.16), transparent 28%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.02), rgba(59, 130, 246, 0.08));
}

.setting-hero__badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.setting-hero h3,
.setting-section__header h3 {
  margin: 10px 0 6px;
  font-size: 17px;
  color: #0f172a;
}

.setting-hero p,
.setting-section__header span,
.setting-layout-card__content span,
.setting-switch-item span,
.setting-sidebar-card__body span,
.setting-color-picker__meta span,
.setting-theme-swatches__meta span,
.setting-color-picker__panel-header span,
.setting-color-picker__actions span {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.setting-hero__preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.72);
}

.setting-hero__preview span {
  color: #64748b;
  font-size: 12px;
}

.setting-hero__preview strong {
  font-size: 20px;
  color: #0f172a;
}

.setting-section__header {
  margin-bottom: 14px;
}

.setting-layout-grid,
.setting-sidebar-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.setting-layout-card,
.setting-sidebar-card,
.setting-theme-swatches__item,
.setting-color-picker {
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-layout-card {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 14px;
  width: 100%;
  padding: 14px;
  border-radius: 18px;
  text-align: left;
}

.setting-layout-card:hover,
.setting-sidebar-card:hover,
.setting-theme-swatches__item:hover,
.setting-color-picker:hover {
  border-color: rgba(var(--primary-color), 0.24);
  transform: translateY(-1px);
}

.setting-layout-card--active,
.setting-sidebar-card--active,
.setting-theme-swatches__item--active,
.setting-color-picker--expanded {
  border-color: rgba(var(--primary-color), 0.32);
  background: rgba(var(--primary-color), 0.06);
  box-shadow: 0 10px 28px rgba(var(--primary-color), 0.12);
}

.setting-layout-card__preview {
  position: relative;
  height: 74px;
  overflow: hidden;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.setting-layout-card__preview::before,
.setting-layout-card__preview::after,
.setting-layout-card__preview-body {
  content: '';
  position: absolute;
  border-radius: 10px;
}

.setting-layout-menu-left::before {
  inset: 0 auto 0 0;
  width: 26%;
  background: #0f172a;
}

.setting-layout-menu-left::after {
  inset: 0 0 auto 0;
  height: 24%;
  background: #ffffff;
}

.setting-layout-menu-left .setting-layout-card__preview-body {
  left: 34%;
  top: 28%;
  right: 8px;
  bottom: 8px;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
}

.setting-layout-menu-top::before {
  inset: 0 0 auto 0;
  height: 28%;
  background: #ffffff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.setting-layout-menu-top::after {
  left: 8px;
  top: 10px;
  width: 48%;
  height: 12px;
  background: rgba(37, 99, 235, 0.16);
}

.setting-layout-menu-top .setting-layout-card__preview-body {
  left: 8px;
  right: 8px;
  top: 34%;
  bottom: 8px;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
}

.setting-layout-menu-mixed::before {
  inset: 0 auto 0 0;
  width: 16%;
  background: #0f172a;
}

.setting-layout-menu-mixed::after {
  left: 20%;
  top: 0;
  right: 0;
  height: 24%;
  background: #ffffff;
}

.setting-layout-menu-mixed .setting-layout-card__preview-body {
  left: 20%;
  top: 28%;
  width: 22%;
  bottom: 8px;
  background: #dbeafe;
}

.setting-layout-card__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.setting-layout-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #0f172a;
}

.setting-layout-card__icon {
  color: rgb(var(--primary-color));
  font-size: 18px;
}

.setting-color-stage {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.setting-color-picker {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border-radius: 18px;
  text-align: left;
}

.setting-color-picker__leading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(var(--primary-color), 0.12), rgba(var(--primary-color), 0.06));
}

.setting-color-picker__swatch {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  box-shadow:
    inset 0 0 0 3px rgba(255, 255, 255, 0.72),
    0 8px 22px rgba(15, 23, 42, 0.12);
}

.setting-color-picker__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.setting-color-picker__title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.setting-color-picker__meta strong,
.setting-color-picker__panel-header strong {
  color: #0f172a;
  font-size: 15px;
}

.setting-color-picker__tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(var(--primary-color), 0.1);
  color: rgb(var(--primary-color));
  font-size: 12px;
  font-weight: 700;
}

.setting-color-picker__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: end;
  white-space: nowrap;
}

.setting-color-picker__action {
  font-size: 20px;
  color: rgb(var(--primary-color));
  transition: transform 0.2s ease;
}

.setting-color-picker__action--expanded {
  transform: rotate(180deg);
}

.setting-color-picker__panel {
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.setting-color-picker__panel-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.setting-color-picker__panel :deep(.n-color-picker) {
  width: 100%;
}

.setting-color-picker__panel :deep(.n-color-picker-trigger) {
  width: 100%;
  min-height: 46px;
  border-radius: 14px;
}

.setting-theme-swatches {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.setting-theme-swatches__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  text-align: left;
}

.setting-theme-swatches__dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.86);
}

.setting-theme-swatches__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.setting-theme-swatches__meta strong {
  color: #0f172a;
  font-size: 14px;
}

.setting-theme-swatches__icon {
  font-size: 18px;
  color: rgb(var(--primary-color));
}

.setting-switch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.setting-switch-item strong,
.setting-sidebar-card__body strong {
  display: block;
  margin-bottom: 4px;
  color: #0f172a;
}

.setting-sidebar-card {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 14px;
  width: 100%;
  padding: 14px;
  border-radius: 18px;
  text-align: left;
}

.setting-sidebar-card__preview {
  position: relative;
  height: 76px;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.setting-sidebar-card__preview::before,
.setting-sidebar-card__preview-main {
  content: '';
  position: absolute;
  border-radius: 10px;
}

.setting-sidebar-card__preview::before {
  inset: 0 auto 0 0;
  width: 28%;
}

.setting-sidebar-card__preview-main {
  left: 34%;
  top: 10px;
  right: 10px;
  bottom: 10px;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
}

.setting-sidebar-card__preview--dark::before {
  background: #0f172a;
}

.setting-sidebar-card__preview--light::before {
  background: #ffffff;
  border-right: 1px solid rgba(148, 163, 184, 0.14);
}

.setting-sidebar-card__preview--theme::before {
  background: linear-gradient(180deg, rgb(var(--primary-color)), rgba(var(--primary-color), 0.72));
}

@media (max-width: 520px) {
  .setting-hero,
  .setting-layout-card,
  .setting-sidebar-card,
  .setting-color-picker {
    grid-template-columns: 1fr;
  }

  .setting-color-picker__actions {
    justify-self: start;
  }

  .setting-theme-swatches {
    grid-template-columns: 1fr;
  }

  .setting-switch-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
