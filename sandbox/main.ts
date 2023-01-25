import { createApp } from 'vue'
import { registerBlox } from 'vue-blox'

import App from './App.vue'

const app = createApp(App)

const blox = registerBlox()

app.use(blox)

app.mount('#app')
