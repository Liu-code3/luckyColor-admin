import { defineStore } from 'pinia';
import type { GlobalThemeOverrides } from 'naive-ui';
import { useDark } from '@vueuse/core';
import { colorBuilder } from '@kviewui/color-builder';
import tool from '@/utils/tool.ts';
import sysConfig, { naiveThemeOverrides } from '@/config';

interface IGlobalState {
  isLocked: boolean;
  layout: string;
  isDark: globalThis.WritableComputedRef<boolean>;
  primaryColor: string;
  naiveThemeOverrides: GlobalThemeOverrides;
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
    naiveThemeOverrides: tool.session.get(Global.NaiveThemeOverrides) ?? naiveThemeOverrides
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
      this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
        primaryColor: color,
        primaryColorHover: this.lightColor[4]
      });
      tool.session.set(Global.PRIMARY_COLOR, color);
      tool.session.set(Global.NaiveThemeOverrides, JSON.stringify(naiveThemeOverrides));
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
      this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
        primaryColor: colorList[5],
        primaryColorHover: colorList[4],
        primaryColorSuppl: colorList[4],
        primaryColorPressed: colorList[6]
      });

      tool.session.set(Global.PRIMARY_COLOR, primaryColor);
      tool.session.set('isDark', isDarkMode);
      tool.session.set(Global.NaiveThemeOverrides, naiveThemeOverrides);
    }
  }
});
