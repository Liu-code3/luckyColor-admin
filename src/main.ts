import { createApp } from 'vue';
import '@/config/vxeTable';
import store from './store';
import App from './App.vue';
import router from './router';
import luckyColor from './luckyColor';
import 'virtual:uno.css';
import './style.css';
import 'animate.css';

const app = createApp(App);
app.use(router);
app.use(store);
app.use(luckyColor);
app.mount('#app');
