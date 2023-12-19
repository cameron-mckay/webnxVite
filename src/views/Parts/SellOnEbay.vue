<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import {
  User,
  CartItem,
} from '../../plugins/interfaces';

import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../../plugins/interfaces';
import EbayInventory from '../../plugins/EbayClass';
import InventoryComponent from '../../components/InventoryComponents/InventoryComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { sellOnEbay } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let inventory:EbayInventory;
let loading = ref(true);
let processingMove = false
let orderID = ref("")

onBeforeMount(async ()=>{
  await Cacher.loadAllUsersFromAPISync()
  inventory = new EbayInventory(store.state.user)
  loading.value = false
})

function submit(sourceUser: User, destUser: User, transferList: CartItem[], callback: ()=>void) {
  if (processingMove)
    return
  if(!window.confirm("Are you sure you want to submit?"))
    return
  processingMove = true;
  // Process transfer list
  let partList = inventory.getOrderList()
  // Move parts
  sellOnEbay(http, partList, orderID.value, (data, err) => {
    processingMove = false;
    if (err) {
      // Handle errors
      return errorHandler(err);
    }
    displayMessage(data as string);
    callback();
  });
}
</script>
<template>
  <div>
    <LoaderComponent v-if="loading"/>
    <InventoryComponent
      v-else
      :inventory="inventory"
      :force-source-user="store.state.user"
      :force-dest-user="{_id: 'ebay'}"
      :submitButtonText="'Mark as sold'"
      :serialize-dest-list="true"
      @submit="submit"
    >
      <div class="my-4 flex flex-wrap">
        <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
          Order:
        </h1>
        <input
          type="text"
          placeholder="eBay Order ID"
          v-model="orderID"
          class="textbox max-w-sm"
        />
      </div>
    </InventoryComponent>
  </div>
</template>
