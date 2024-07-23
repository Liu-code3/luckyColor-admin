import { defineStore } from 'pinia';
import type { GlobalThemeOverrides } from 'naive-ui';
import { useDark } from '@vueuse/core';
import tool from '@/utils/tool.ts';
import sysConfig, { naiveThemeOverrides } from '@/config';

interface IGlobalState {
  isLocked: boolean;
  layout: string;
  isDark: globalThis.WritableComputedRef<boolean>;
  primaryColor: string;
  naiveThemeOverrides: GlobalThemeOverrides;
  darkColor: string[];
  lightColor: string[];
}

enum Global {
  LOCK_SCREEN = 'LOCK_SCREEN',
  LAYOUT = 'layout',
  PRIMARY_COLOR = 'primaryColor',
  NaiveThemeOverrides = 'naiveThemeOverrides'
}
// 明亮主题
/**
 * 大背景 #f5f6fb
 * 字体 #333639
 * 边框 rgb(239, 239, 245);
 * card #FFF
 */

// 暗黑主题
/**
 * 大背景 #121212
 * 字体 #FFFFFFD1
 * 边框 rgba(255, 255, 255, 0.09)
 * card rgb(24, 24, 28)
 */

export const useGlobalStore = defineStore('layout', {
  state: (): IGlobalState => ({
    isLocked: tool.session.get(Global.LOCK_SCREEN) ?? false,
    layout: tool.session.get(Global.LAYOUT) ?? sysConfig.LUCK_LAYOUT,
    isDark: useDark(),
    primaryColor: tool.session.get(Global.PRIMARY_COLOR) ?? sysConfig.COLOR,
    naiveThemeOverrides: tool.session.get(Global.NaiveThemeOverrides) ?? naiveThemeOverrides,
    lightColor: [ '#f5f6fb', '#333639', '#EFEFF5', '#ffffff', '#666666' ],
    darkColor: [ '#121212', '#FFFFFFD1', 'rgba(255, 255, 255, 0.09)', '#18181C', '#000000' ]
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
    toggleDark() {
      this.isDark = !this.isDark;
    },
    setPrimaryColor(color: string) {
      this.primaryColor = color;
    },
    setThemeColor(color: string, isDark: boolean) {
      const primaryColor = color || this.primaryColor;
      const isDarkMode = isDark || this.isDark;

      const bodyStyle = document.body.style;
      if (isDarkMode) {
        this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
          primaryColor: this.darkColor[1],
          primaryColorHover: this.darkColor[4]
        });
        bodyStyle.setProperty('--primary-color', this.darkColor[1]);
        bodyStyle.setProperty('--primary-bgColor', this.darkColor[3]);
        bodyStyle.setProperty('--primary-bColor', this.darkColor[2]);
        bodyStyle.setProperty('--primary-main-bg', this.darkColor[0]);
      }
      else {
        // https://www.naiveui.com/zh-CN/os-theme/docs/customize-theme naive-ui 配置主题色
        this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
          primaryColor: this.lightColor[1],
          primaryColorHover: this.lightColor[4]
        });
        bodyStyle.setProperty('--primary-color', this.lightColor[1]);
        bodyStyle.setProperty('--primary-bgColor', this.lightColor[3]);
        bodyStyle.setProperty('--primary-bColor', this.lightColor[2]);
        bodyStyle.setProperty('--primary-main-bg', this.lightColor[0]);
      }

      tool.session.set(Global.PRIMARY_COLOR, primaryColor);
      tool.session.set('isDark', isDarkMode);
      tool.session.set(Global.NaiveThemeOverrides, JSON.stringify(naiveThemeOverrides));
    }
  }
});
