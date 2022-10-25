import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { key, createGlobalStore } from './plugins/store'
import axios from './plugins/axios'

// Create root app instance
const app = createApp(App)
// Set up axios instance
app.use(axios,{});
// Create global store
app.use(createGlobalStore(app), key)
// Add router and mount app
app.use(router).mount('#app')