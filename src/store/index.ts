import type { App } from 'vue';
import { createPinia } from 'pinia';

const pinia = createPinia();

function registerStore(app: App<Element>) {
  app.use(pinia);
}

export default registerStore;
