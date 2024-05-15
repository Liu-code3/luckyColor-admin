import type { App } from 'vue';
import errorHandler from '@/utils/errorHandler';

export default {
  install(app: App) {
    app.config.errorHandler = errorHandler;
  }
};
