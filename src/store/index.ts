import type { App } from 'vue';
import { createPinia } from 'pinia';
import { addRoutesWithMenu } from '@/router';

const pinia = createPinia();

function registerStore(app: App<Element>) {
  app.use(pinia);

  addRoutesWithMenu();
}

export default registerStore;
