import { createApp } from 'vue'
import {
  // create naive ui
  create,
  // component
  NButton
} from 'naive-ui'
import App from './App.vue'
import router from './router'

import 'virtual:uno.css'

const naive = create({
  components: [NButton],
})

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')
