import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import {
    // create naive ui
    create,
    // component
    NButton
  } from 'naive-ui'

  const naive = create({
    components: [NButton]
  })
  

  const app = createApp(App)
  app.use(router),
  app.use(naive),
  app.mount('#app')