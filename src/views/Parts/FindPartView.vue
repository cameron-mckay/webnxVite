<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onMounted, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import SearchComponent from '../../components/PartComponents/PartSearchComponent.vue';
import type { PartSchema, UserState } from '../../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
  revokeLogin: () => void;
}
let currentBuilding = ref(3);
let add = ref({ show: false });

onMounted(() => {
  // Wait for user state to load into store (for reloads)
  setTimeout(() => {
    // Set local variables to user state
    currentBuilding.value = store.state.user.building!;
    // If user is kiosk, show add to cart buttons
    if(store.state.user.roles&&store.state.user.roles.includes('kiosk'))
      add.value.show = true
  }, 500);
});

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

function addToCart(part: PartSchema) {
  // Check if cart quantity < available quantity
  if (
    part.quantity &&
    part.nxid &&
    store.getters.getQuantity(part.nxid) < part.quantity
  ) {
    // Add to cart
    displayMessage(`Added ${part.manufacturer} ${part.name} to cart`);
    store.commit('addToCart', part);
  } else {
    // Not enough stock
    errorHandler(`Not enough stock`);
  }
}

function viewPart(part: PartSchema) {
  router.push({ name: 'Part View', query: { nxid: part.nxid } });
}
</script>
<template>
  <div>
    <h1 class="mb-4 text-4xl">Part Search</h1>
    <SearchComponent
      :router="router"
      :add_object="add"
      :view="true"
      :http="http"
      :errorHandler="errorHandler"
      @viewPartAction="viewPart"
      :building="currentBuilding"
      :displayMessage="displayMessage"
      :revokeLogin="revokeLogin"
      :kioskName="store.state.user.roles?.includes('kiosk')?store.state.user.first_name+' '+store.state.user.last_name:undefined"
      @addPartAction="addToCart"
    />
  </div>
</template>
