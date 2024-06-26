import { createApp } from 'vue';
import {
  // component
  NButton,
  // create naive ui
  create
} from 'naive-ui';
import '@/config/vxeTable';
import store from './store';
import App from './App.vue';
import router from './router';
import luckyColor from './luckyColor';
import 'virtual:uno.css';
import './style.css';
import 'animate.css';

const naive = create({
  components: [NButton]
});

const app = createApp(App);
app.use(store);
app.use(router);
app.use(naive);
app.use(luckyColor);
app.mount('#app');
