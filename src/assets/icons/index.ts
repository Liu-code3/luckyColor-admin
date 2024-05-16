import { defineAsyncComponent } from 'vue';
import type { App, Component } from 'vue';

const components = import.meta.glob('./uiw/*.vue'); // 异步方式

export default function install(app: App<Element>) {
  for (const [key, value] of Object.entries(components)) {
    const name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
    const asyncComponent = defineAsyncComponent(value as () => Promise<Component>);
    app.component(name, asyncComponent);
  }
}
