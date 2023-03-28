import { createApp } from "vue";
import App from "./App.vue";
import axios from "./plugins/axios";
import { createGlobalStore, key } from "./plugins/store";
import "./registerServiceWorker";
import router from "./router/index";
import "./style.css";

// Create root app instance
const app = createApp(App);
// Set up axios instance
app.use(axios, {});
// Create global store
app.use(createGlobalStore(app), key);
// Add router and mount app
app.use(router).mount("#app");
