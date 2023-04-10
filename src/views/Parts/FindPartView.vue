<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
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
}
let currentBuilding = ref(3);
let add = ref({ show: false });

onMounted(() => {
  setTimeout(() => {
    currentBuilding.value = store.state.user.building!;
    add.value.show = store.state.user.role == 'kiosk';
  }, 500);
});

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

function addToCart(part: PartSchema) {
  displayMessage(`Added ${part.manufacturer} ${part.name} to cart`);
  store.commit('addToCart', part);
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
      :location="'Parts Room'"
      :building="currentBuilding"
      :displayMessage="displayMessage"
      @addPartAction="addToCart"
    />
  </div>
</template>
