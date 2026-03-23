import { createApp } from 'vue';
import '@/config/vxeTable';
import store from './store';
import App from './App.vue';
import router from './router';
import luckyColor from './luckyColor';
import { registerPermissionDirective } from '@/directives/permission';
import 'virtual:uno.css';
import './style.scss';
import 'animate.css';

const app = createApp(App);
app.use(store);
app.use(router);
app.use(luckyColor);
registerPermissionDirective(app);
app.mount('#app');
