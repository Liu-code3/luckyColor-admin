import { createApp } from 'vue'
import App from './App.vue'

import {
    // create naive ui
    create,
    // component
    NButton
  } from 'naive-ui'

import 'virtual:uno.css'

  const naive = create({
    components: [NButton]
  })
  

  const app = createApp(App)
  app.use(naive),
  app.mount('#app')