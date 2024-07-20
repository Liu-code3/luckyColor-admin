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

export const useGlobalStore = defineStore('layout', {
  state: (): IGlobalState => ({
    isLocked: tool.session.get(Global.LOCK_SCREEN) ?? false,
    layout: tool.session.get(Global.LAYOUT) ?? sysConfig.LUCK_LAYOUT,
    isDark: useDark(),
    primaryColor: tool.session.get(Global.PRIMARY_COLOR) ?? sysConfig.COLOR,
    naiveThemeOverrides: tool.session.get(Global.NaiveThemeOverrides) ?? naiveThemeOverrides,
    lightColor: [ '#333639', '#FFFFFF', '#dde0e7', '#666666', '#333333', '#FFC0CB', '#000000', '#000000', '#000000', '#000000' ],
    darkColor: [ '#FFFFFFD1', '#000000', '#000000', '#000000', '#000000', '#FF1493', '#666464', '#999393', '#CCC0C0', '#FFEBEB' ]
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
          primaryColor: this.darkColor[0],
          primaryColorHover: this.darkColor[4],
          primaryColorSuppl: this.darkColor[4],
          primaryColorPressed: this.darkColor[6]
        });
        bodyStyle.setProperty('--primary-color', this.darkColor[0]);
        bodyStyle.setProperty('--primary-bgColor', this.darkColor[1]);
        bodyStyle.setProperty('--primary-bColor', this.darkColor[2]);
      }
      else {
        // https://www.naiveui.com/zh-CN/os-theme/docs/customize-theme naive-ui 配置主题色
        this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
          primaryColor: this.lightColor[0],
          primaryColorHover: this.lightColor[4],
          primaryColorSuppl: this.lightColor[4],
          primaryColorPressed: this.lightColor[6]
        });
        bodyStyle.setProperty('--primary-color', this.lightColor[0]);
        bodyStyle.setProperty('--primary-bgColor', this.lightColor[1]);
        bodyStyle.setProperty('--primary-bColor', this.lightColor[2]);
      }

      tool.session.set(Global.PRIMARY_COLOR, primaryColor);
      tool.session.set('isDark', isDarkMode);
      tool.session.set(Global.NaiveThemeOverrides, JSON.stringify(naiveThemeOverrides));
    }
  }
});
