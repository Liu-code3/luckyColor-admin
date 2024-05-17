import type { App } from 'vue';
import errorHandler from '@/utils/errorHandler';
import customIcons from '@/assets/icons';

export default {
  install(app: App<Element>) {
    // 统一注册自定义全局图标
    app.use(customIcons);

    // 全局代码错误捕捉
    app.config.errorHandler = errorHandler;
  }
};
