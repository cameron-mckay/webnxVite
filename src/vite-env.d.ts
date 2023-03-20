/// <reference types="vite/client" />

import { AxiosInstance } from "axios";
import { RouteLocation, Router } from "vue-router";
import { Store } from "vuex";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $store: Store;
    $router: Router;
    $route: RouteLocation;
  }
}
