import { defineStore } from 'pinia';
import type { GlobalThemeOverrides } from 'naive-ui';
import { useDark } from '@vueuse/core';
import { colorBuilder } from '@kviewui/color-builder';
import tool from '@/utils/tool.ts';
import sysConfig, { naiveThemeOverrides } from '@/config';
import VxeUI from '@/config/vxeTable.ts';

interface IGlobalState {
  isLocked: boolean;
  layout: string;
  isDark: globalThis.WritableComputedRef<boolean>;
  primaryColor: string;
  naiveThemeOverrides: GlobalThemeOverrides;
  showTabs: boolean;
  showWatermark: boolean;
  grayMode: boolean;
  colorWeakMode: boolean;
  sidebarTheme: 'dark' | 'light' | 'theme';
}

enum Global {
  LOCK_SCREEN = 'LOCK_SCREEN',
  LAYOUT = 'layout',
  PRIMARY_COLOR = 'primaryColor',
  NaiveThemeOverrides = 'naiveThemeOverrides',
  SHOW_TABS = 'SHOW_TABS',
  SHOW_WATERMARK = 'SHOW_WATERMARK',
  GRAY_MODE = 'GRAY_MODE',
  COLOR_WEAK_MODE = 'COLOR_WEAK_MODE',
  SIDEBAR_THEME = 'SIDEBAR_THEME'
}

export const useGlobalStore = defineStore('layout', {
  state: (): IGlobalState => ({
    isLocked: tool.session.get(Global.LOCK_SCREEN) ?? false,
    layout: tool.session.get(Global.LAYOUT) ?? sysConfig.LUCK_LAYOUT,
    isDark: useDark(),
    primaryColor: tool.session.get(Global.PRIMARY_COLOR) ?? sysConfig.COLOR,
    naiveThemeOverrides: tool.session.get(Global.NaiveThemeOverrides) ?? naiveThemeOverrides,
    showTabs: tool.session.get(Global.SHOW_TABS) ?? sysConfig.LUCK_LAYOUT_TAGS_OPEN,
    showWatermark: tool.session.get(Global.SHOW_WATERMARK) ?? false,
    grayMode: tool.session.get(Global.GRAY_MODE) ?? false,
    colorWeakMode: tool.session.get(Global.COLOR_WEAK_MODE) ?? false,
    sidebarTheme: tool.session.get(Global.SIDEBAR_THEME) ?? 'dark'
  }),
  actions: {
    updateIsLock(isLocked: boolean) {
      this.isLocked = isLocked;
      tool.session.set(Global.LOCK_SCREEN, isLocked);
    },
    updateLayout(layout: string) {
      this.layout = layout;
      tool.session.set(Global.LAYOUT, layout);
    },
    updateShowTabs(showTabs: boolean) {
      this.showTabs = showTabs;
      tool.session.set(Global.SHOW_TABS, showTabs);
    },
    updateShowWatermark(showWatermark: boolean) {
      this.showWatermark = showWatermark;
      tool.session.set(Global.SHOW_WATERMARK, showWatermark);
    },
    updateGrayMode(grayMode: boolean) {
      this.grayMode = grayMode;
      tool.session.set(Global.GRAY_MODE, grayMode);
    },
    updateColorWeakMode(colorWeakMode: boolean) {
      this.colorWeakMode = colorWeakMode;
      tool.session.set(Global.COLOR_WEAK_MODE, colorWeakMode);
    },
    updateSidebarTheme(sidebarTheme: 'dark' | 'light' | 'theme') {
      this.sidebarTheme = sidebarTheme;
      tool.session.set(Global.SIDEBAR_THEME, sidebarTheme);
      this.applySidebarTheme(sidebarTheme, this.primaryColor);
    },
    toggleDark() {
      this.isDark = !this.isDark;
    },
    setPrimaryColor(color: string) {
      this.primaryColor = color;
      tool.session.set(Global.PRIMARY_COLOR, color);
    },
    applyAppearanceModes() {
      const app = document.querySelector('#app');
      if (!app) {
        return;
      }

      app.classList.toggle('app-gray-mode', this.grayMode);
      app.classList.toggle('colorWeak', this.colorWeakMode);
    },
    applySidebarTheme(sidebarTheme = this.sidebarTheme, primaryColor = this.primaryColor) {
      const rootStyle = document.documentElement.style;
      const themeColorList = colorBuilder.generate(primaryColor, {
        dark: this.isDark,
        list: true,
        format: 'hex'
      });

      const themeMap = {
        dark: {
          background: '#0f172a',
          text: 'rgba(226, 232, 240, 0.86)',
          textActive: '#ffffff',
          hover: 'rgba(148, 163, 184, 0.16)',
          border: 'rgba(148, 163, 184, 0.12)',
          accent: primaryColor
        },
        light: {
          background: '#ffffff',
          text: '#334155',
          textActive: '#0f172a',
          hover: 'rgba(37, 99, 235, 0.08)',
          border: 'rgba(148, 163, 184, 0.16)',
          accent: primaryColor
        },
        theme: {
          background: `linear-gradient(180deg, ${themeColorList[6]}, ${themeColorList[8]})`,
          text: 'rgba(255, 255, 255, 0.82)',
          textActive: '#ffffff',
          hover: 'rgba(255, 255, 255, 0.14)',
          border: 'rgba(255, 255, 255, 0.12)',
          accent: '#ffffff'
        }
      } satisfies Record<'dark' | 'light' | 'theme', {
        background: string;
        text: string;
        textActive: string;
        hover: string;
        border: string;
        accent: string;
      }>;

      const activeTheme = themeMap[sidebarTheme];
      rootStyle.setProperty('--layout-sider-bg', activeTheme.background);
      rootStyle.setProperty('--layout-sider-text', activeTheme.text);
      rootStyle.setProperty('--layout-sider-text-active', activeTheme.textActive);
      rootStyle.setProperty('--layout-sider-hover', activeTheme.hover);
      rootStyle.setProperty('--layout-sider-border', activeTheme.border);
      rootStyle.setProperty('--layout-sider-accent', activeTheme.accent);
    },
    setThemeColor(color: string, isDark: boolean) {
      const primaryColor = color || this.primaryColor;
      const isDarkMode = isDark || this.isDark;

      // 生成暗黑模式下的色阶集合
      const colorList = colorBuilder.generate(primaryColor, {
        dark: isDarkMode, // 暗黑模式
        list: true, // 生成色阶集合,
        format: 'hex' // 颜色值格式
      });

      const bodyStyle = document.body.style;
      const rgbStr = colorBuilder.getRgbStr(colorList[5]);
      bodyStyle.setProperty('--primary-color', rgbStr);
      VxeUI.setTheme(isDarkMode ? 'dark' : 'light');

      this.primaryColor = primaryColor;
      this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
        primaryColor: colorList[5],
        primaryColorHover: colorList[4],
        primaryColorSuppl: colorList[4],
        primaryColorPressed: colorList[6]
      });
      this.applySidebarTheme(this.sidebarTheme, primaryColor);

      tool.session.set(Global.PRIMARY_COLOR, primaryColor);
      tool.session.set('isDark', isDarkMode);
      tool.session.set(Global.NaiveThemeOverrides, this.naiveThemeOverrides);
    }
  }
})
;
