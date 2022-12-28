import { createApp } from 'vue'
import App from './App.vue'
import axios from './plugins/axios'
import { smoothResize } from './plugins/smoothResize'
import { createGlobalStore, key } from './plugins/store'
import './registerServiceWorker'
import router from './router/index'
import './style.css'
// Create root app instance
const app = createApp(App)
// Set up axios instance
app.use(axios, {});
// Create global store
app.use(createGlobalStore(app), key)

// Add the v-smooth-resize directive for all components
app.directive('smooth-resize', {
    beforeUpdate(el, binding, vnode) {
        smoothResize(el, binding, vnode)
    },

})

// Add router and mount app
app.use(router).mount('#app')
