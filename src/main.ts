import { createApp } from 'vue'
import App from './App.vue'
import {
    // create naive ui
    create,
    // component
    NButton
  } from 'naive-ui'

  const naive = create({
    components: [NButton]
  })
  

  let app = createApp(App)
  app.use(naive),
  app.mount('#app')